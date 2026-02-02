import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { API_URL } from '../config';

export default function Connection() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('disconnected'); // disconnected, initializing, ready, connected, error
    const [clientInfo, setClientInfo] = useState(null);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Check initial status
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/api/whatsapp/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.status === 'connected') {
                    setStatus('connected');
                    setClientInfo(data);
                    addLog('Bağlantı aktif: ' + data.user);
                } else if (data.status === 'initializing') {
                    setStatus('initializing');
                    addLog('İstemci başlatılıyor...');
                }
            } catch (error) {
                console.error('Status check check error:', error);
            }
        };
        checkStatus();

        if (!socket || !user) return;

        // Socket Event Listeners
        socket.on(`whatsapp-qr-${user._id}`, (data) => {
            setQrCode(data.qr);
            setStatus('qr_received');
            addLog('QR Kod alındı, taranmayı bekliyor...');
        });

        socket.on(`whatsapp-status-${user._id}`, (data) => {
            console.log('Socket Status:', data);
            if (data.status === 'ready') {
                setStatus('connected');
                setClientInfo(data.info);
                addLog('WhatsApp bağlantısı başarılı!');
                setQrCode('');
            } else if (data.status === 'authenticated') {
                addLog('Kimlik doğrulandı, hazırlanıyor...');
                setStatus('initializing');
            } else if (data.status === 'disconnected') {
                setStatus('disconnected');
                setClientInfo(null);
                addLog('Bağlantı kesildi: ' + (data.reason || 'Bilinmeyen sebep'));
            } else if (data.status === 'auth_failure') {
                setStatus('error');
                addLog('Kimlik doğrulama hatası!');
            }
        });

        return () => {
            socket.off(`whatsapp-qr-${user._id}`);
            socket.off(`whatsapp-status-${user._id}`);
        };
    }, [socket, user]);

    const addLog = (message) => {
        setLogs(prev => [`${new Date().toLocaleTimeString()} - ${message}`, ...prev.slice(0, 4)]);
    };

    const handleConnect = async () => {
        try {
            setStatus('initializing');
            addLog('Bağlantı başlatılıyor...');
            const token = localStorage.getItem('token');
            await axios.get(`${API_URL}/api/whatsapp/connect`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            addLog('Hata: ' + error.message);
            setStatus('error');
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/whatsapp/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('disconnected');
            setClientInfo(null);
            setQrCode('');
            addLog('Çıkış yapıldı.');
        } catch (error) {
            addLog('Çıkış hatası: ' + error.message);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        WhatsApp Bağlantısı
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Connection Card */}
                <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
                    {status === 'connected' ? (
                        <div className="text-center">
                            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">Bağlantı Aktif</h3>
                            <p className="mt-2 text-gray-500">
                                Bağlı Numara: {clientInfo?.user || user.whatsappNumber || 'Bilinmiyor'}
                            </p>
                            <button
                                onClick={handleLogout}
                                className="mt-8 rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                                Bağlantıyı Kes
                            </button>
                        </div>
                    ) : status === 'initializing' || status === 'qr_received' ? (
                        <div className="text-center w-full">
                            {qrCode ? (
                                <div className="bg-white p-4 inline-block">
                                    <QRCodeSVG value={qrCode} size={256} />
                                    <p className="mt-4 text-sm text-gray-500 animate-pulse">
                               Telefondan WhatsApp > Bağlı Cihazlar > Cihaz Bağla
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <ArrowPathIcon className="h-16 w-16 text-indigo-500 animate-spin" />
                                    <p className="mt-4 text-lg text-gray-900">QR Kod Oluşturuluyor...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
                                <QRCodeSVG value="https://whatsapp.com" size={64} className="opacity-20" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Henüz Bağlı Değil</h3>
                            <p className="mt-2 text-gray-500 max-w-sm">
                                Mesaj gönderebilmek için WhatsApp hesabınızı bağlamanız gerekmektedir.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="mt-6 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                QR Kodu Oluştur
                            </button>
                        </div>
                    )}
                </div>

                {/* Status & Logs Card */}
                <div className="space-y-6">
                    {/* Status Box */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Durum Bilgisi</h3>
                        <div className="flex items-center gap-x-3">
                            <span className={`flex h-3 w-3 rounded-full ${status === 'connected' ? 'bg-green-500' :
                                status === 'initializing' ? 'bg-yellow-500' :
                                    status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                                }`} />
                            <span className="capitalize text-sm font-medium text-gray-700">
                                {status === 'qr_received' ? 'QR Bekleniyor' : status}
                            </span>
                        </div>
                    </div>

                    {/* How To */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Nasıl Bağlanır?</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ol className="list-decimal pl-5 space-y-1">
                                        <li>Telefonunuzda WhatsApp'ı açın</li>
                                        <li>Ayarlar veya Menü'ye dokunun</li>
                                        <li>Bağlı Cihazlar'ı seçin</li>
                                        <li>"Cihaz Bağla" butonuna basın</li>
                                        <li>Ekrandaki QR kodu taratın</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Area */}
                    <div className="bg-gray-900 shadow sm:rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto">
                        <div className="mb-2 text-gray-500 border-b border-gray-700 pb-1">Sistem Logları</div>
                        {logs.length === 0 && <span className="text-gray-600">Henüz bir işlem yok...</span>}
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
