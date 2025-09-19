import { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';

interface CV {
  id: string;
  title: string;
}

interface CVDropdownProps {
  cvs: CV[];
  selectedCV: CV | undefined;
  onSelectCV: (cv: CV) => void;
  onAddCV: () => void;
}

export default function CVDropdown({ cvs, selectedCV, onSelectCV, onAddCV }: CVDropdownProps) {
  return (
    <div className="w-full">
      <Listbox value={selectedCV} onChange={onSelectCV}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-gray-600 py-3 pl-4 pr-10 text-left text-white focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border border-gray-500">
            <span className="block truncate text-gray-800 font-medium">
              {selectedCV ? selectedCV.title : 'Liste des CVs'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-300"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg   focus:outline-none sm:text-sm">
              {cvs.map((cv) => (
                <ListboxOption
                  key={cv.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 text-left ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                  value={cv}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate text-left ${selected ? 'font-medium' : 'font-normal'}`}>
                        {cv.title}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
              
              {/* Séparateur */}
              {cvs.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}
              
              {/* Bouton Ajouter un CV */}
              <button
                onClick={onAddCV}
                className="w-full text-left cursor-pointer select-none py-2 px-4 text-indigo-600 hover:bg-indigo-50 flex items-center font-medium"
              >
                <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Ajouter un CV</span>
              </button>
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
