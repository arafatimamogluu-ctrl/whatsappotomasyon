import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Tab } from '@headlessui/react';
import { PhotoIcon, VideoCameraIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { API_URL } from '../config';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sender() {
  const { user } = useAuth();
  const [messageType, setMessageType] = useState('text'); // text, image, video
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock function for now, real implementation will use API
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement actual API call
      alert(`Mesaj gönderiliyor (Simülasyon):\nTip: ${messageType}\nİçerik: ${text}\nHedef: ${target}`);
      // const token = localStorage.getItem('token');
      // await axios.post(`${API_URL}/api/messages/send`, { ... }, { headers: ... });

      setText('');
    } catch (error) {
      console.error(error);
      alert('Gönderim hatası!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Yeni Mesaj Oluştur
          </h2>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSend}>

            {/* Target Selection */}
            <div className="mb-6">
              <label htmlFor="target" className="block text-sm font-medium leading-6 text-gray-900">
                Alıcı Numarası veya Grup ID
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="target"
                  id="target"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="905xxxxxxxxx veya Grup Adı"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  * Çoklu gönderim için numaraları virgül ile ayırın (şimdilik manuel).
                </p>
              </div>
            </div>

            {/* Message Type Tabs */}
            <Tab.Group onChange={(index) => {
              const types = ['text', 'image', 'video'];
              setMessageType(types[index]);
            }}>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    Metin
                  </div>
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    <PhotoIcon className="h-5 w-5" />
                    Resim
                  </div>
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    <VideoCameraIcon className="h-5 w-5" />
                    Video
                  </div>
                </Tab>
              </Tab.List>

              <Tab.Panels>
                {/* Text Panel */}
                <Tab.Panel>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900">
                      Mesaj İçeriği
                    </label>
                    <div className="mt-2">
                      <textarea
                        rows={4}
                        name="message"
                        id="message"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required={messageType === 'text'}
                      />
                    </div>
                  </div>
                </Tab.Panel>

                {/* Image Panel */}
                <Tab.Panel>
                  <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 cursor-pointer transition-colors">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Resim Seçin veya Sürükleyin</span>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Resim Açıklaması (Opsiyonel)</label>
                    <textarea
                      rows={2}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </Tab.Panel>

                {/* Video Panel */}
                <Tab.Panel>
                  <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 cursor-pointer transition-colors">
                    <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Video Seçin (Max 16MB)</span>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium leading-6 text-gray-900">Video Açıklaması (Opsiyonel)</label>
                    <textarea
                      rows={2}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            <div className="flex justify-end pt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
