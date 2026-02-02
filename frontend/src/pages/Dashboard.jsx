import { Link } from 'react-router-dom';
import { PaperAirplaneIcon, QrCodeIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const stats = [
    { name: 'Kalan Mesaj Hakkı', stat: '50', icon: PaperAirplaneIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Aktif Bağlantı', stat: 'Bağlı Değil', icon: QrCodeIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Toplam Grup', stat: '0', icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Bekleyen Görev', stat: '0', icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
]

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Hoş Geldin, {user?.fullName} 👋
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        WhatsApp Otomasyon Paneline genel bakış.
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        to="/sender"
                        className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Hemen Mesaj Gönder
                    </Link>
                </div>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </dl>

            {/* Recent Activity or Quick Actions could go here */}
            <div className="mt-8">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Hızlı Başlangıç</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>WhatsApp bağlantınızı kurarak hemen mesaj göndermeye başlayabilirsiniz.</p>
                        </div>
                        <div className="mt-5">
                            <Link
                                to="/connection"
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Bağlantı Sayfasına Git
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
