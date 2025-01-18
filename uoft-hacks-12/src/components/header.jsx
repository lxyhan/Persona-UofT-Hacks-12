import { BeakerIcon } from '@heroicons/react/24/solid';

export default function Header() {
    return (
      <div className="md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-start space-x-5">
          <div className="shrink-0">
            <div className="relative">
                <img
                alt=""
                src="/teacher.png"
                className="size-16 rounded-full"
                />
              <span className="absolute inset-0 rounded-full shadow-inner" />
            </div>
          </div>
          <div className="pt-1.5">
            <h1 className="text-2xl font-bold text-gray-900">Madame Dubois</h1>
            <p className="text-sm font-medium text-gray-700">
              Professeur de{' '}
              <a href="#" className="text-gray-900">
                Français
              </a>{' '}
              <span className="text-gray-800">• En ligne maintenant</span>
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-300"
            >

                Voice Input
            </button>
            
            <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
                <BeakerIcon className="h-5 w-5 mr-2" />  {/* Chat Icon */}
                Start Conversation
            </button>
        </div>

      </div>
    )
}