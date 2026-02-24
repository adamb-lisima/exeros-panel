<template>
  <div class="dialog-container bg-white rounded-lg shadow-md">
    <div class="flex justify-between items-center p-4 border-b border-new-gray-300">
      <h2 class="font-semibold text-lg">{{ isEditMode ? 'Edit' : 'Create' }} Application Setting</h2>
      <div class="rounded-md cursor-pointer bg-anti-flash-white" @click="handleCloseClick">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7279 21.2129L21.2132 12.7276" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21.2132 21.2138L12.7279 12.7285" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div class="flex flex-col p-4 overflow-y-auto max-h-[60vh]">
      <text-control v-model="formData.name" label="Name*" placeholder="Enter setting name" :error-message="touched.name && !formData.name ? 'Name is required' : ''" @blur="touched.name = true" class="mb-4"></text-control>
      <select-control v-model="formData.type" label="Type*" :options="typeOptions" :error-message="touched.type && !formData.type ? 'Type is required' : ''" @blur="touched.type = true" class="mb-4 mt-2"></select-control>
      <select-control v-model="formData.input_type" label="Input type*" :options="inputTypeOptions" :error-message="touched.input_type && !formData.input_type ? 'Input type is required' : ''" @blur="touched.input_type = true" class="mb-4"></select-control>

      <div v-if="['select', 'multi-select'].includes(formData.input_type)" class="mt-4">
        <div @click="toggleOptionsSection" class="flex items-center gap-3 cursor-pointer mb-2">
          <span class="text-sm text-main-primary font-semibold">Options</span>
          <svg v-if="isOptionsOpen" width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.55771 3.57041C1.24247 3.57041 1.02512 3.42541 0.905657 3.13542C0.78619 2.84545 0.836947 2.58997 1.05793 2.36897L2.69352 0.733397C2.76981 0.657112 2.84777 0.602701 2.92741 0.570166C3.00706 0.53763 3.094 0.521362 3.18823 0.521362C3.28246 0.521362 3.3694 0.53763 3.44904 0.570166C3.52869 0.602701 3.60667 0.657112 3.68295 0.733397L5.31852 2.36897C5.53952 2.58997 5.59028 2.84545 5.47082 3.13542C5.35134 3.42541 5.13398 3.57041 4.81877 3.57041H1.55771Z" fill="#EE8444" />
          </svg>
          <svg v-else width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.56315 3.10069L0.927557 1.46511C0.706576 1.24412 0.655819 0.988631 0.775285 0.698656C0.894752 0.408667 1.1121 0.263672 1.42734 0.263672H4.68839C5.00361 0.263672 5.22096 0.408667 5.34045 0.698656C5.45991 0.988631 5.40915 1.24412 5.18815 1.46511L3.55258 3.10069C3.47629 3.17697 3.39832 3.23138 3.31867 3.26392C3.23903 3.29645 3.15209 3.31272 3.05785 3.31272C2.96363 3.31272 2.87669 3.29645 2.79704 3.26392C2.7174 3.23138 2.63944 3.17697 2.56315 3.10069Z" fill="#EE8444" />
          </svg>
        </div>

        <div v-if="isOptionsOpen">
          <div class="flex flex-col gap-2">
            <div v-for="(option, index) in formData.options" :key="index" class="flex gap-2 items-center">
              <text-control v-model="formData.options[index]" label="Option" :error-message="optionTouched[index] && !option ? 'Option cannot be empty' : ''" @blur="optionTouched[index] = true" class="flex-1"></text-control>
              <button type="button" @click="removeOption(index)" class="text-red-500 hover:text-red-700 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="mask0_41_503" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <rect width="24" height="24" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_41_503)">
                    <path d="M7.56887 20.1398C7.06374 20.1398 6.63617 19.9648 6.28617 19.6148C5.93617 19.2648 5.76117 18.8372 5.76117 18.3321V5.63982H5.51117C5.29835 5.63982 5.12015 5.56803 4.97657 5.42445C4.83297 5.28087 4.76117 5.10267 4.76117 4.88985C4.76117 4.67703 4.83297 4.49883 4.97657 4.35525C5.12015 4.21165 5.29835 4.13985 5.51117 4.13985H9.26114C9.26114 3.88858 9.34896 3.67833 9.52459 3.5091C9.70024 3.33987 9.91371 3.25525 10.165 3.25525H14.3573C14.6086 3.25525 14.822 3.33987 14.9977 3.5091C15.1733 3.67833 15.2611 3.88858 15.2611 4.13985H19.0111C19.2239 4.13985 19.4021 4.21165 19.5457 4.35525C19.6893 4.49883 19.7611 4.67703 19.7611 4.88985C19.7611 5.10267 19.6893 5.28087 19.5457 5.42445C19.4021 5.56803 19.2239 5.63982 19.0111 5.63982H18.7611V18.3321C18.7611 18.8372 18.5861 19.2648 18.2361 19.6148C17.8861 19.9648 17.4586 20.1398 16.9534 20.1398H7.56887ZM7.26114 5.63982V18.3321C7.26114 18.4219 7.28999 18.4956 7.34769 18.5533C7.40539 18.611 7.47912 18.6398 7.56887 18.6398H16.9534C17.0432 18.6398 17.1169 18.611 17.1746 18.5533C17.2323 18.4956 17.2611 18.4219 17.2611 18.3321V5.63982H7.26114ZM9.66502 15.8899C9.66502 16.1027 9.73681 16.2809 9.88039 16.4244C10.024 16.568 10.2022 16.6398 10.415 16.6398C10.6278 16.6398 10.806 16.568 10.9496 16.4244C11.0932 16.2809 11.165 16.1027 11.165 15.8899V8.3898C11.165 8.17698 11.0932 7.99878 10.9496 7.8552C10.806 7.71162 10.6278 7.63982 10.415 7.63982C10.2022 7.63982 10.024 7.71162 9.88039 7.8552C9.73681 7.99878 9.66502 8.17698 9.66502 8.3898V15.8899ZM13.3573 15.8899C13.3573 16.1027 13.4291 16.2809 13.5727 16.4244C13.7163 16.568 13.8945 16.6398 14.1073 16.6398C14.3201 16.6398 14.4983 16.568 14.6419 16.4244C14.7855 16.2809 14.8573 16.1027 14.8573 15.8899V8.3898C14.8573 8.17698 14.7855 7.99878 14.6419 7.8552C14.4983 7.71162 14.3201 7.63982 14.1073 7.63982C13.8945 7.63982 13.7163 7.71162 13.5727 7.8552C13.4291 7.99878 13.3573 8.17698 13.3573 8.3898V15.8899ZM7.26114 5.63982V18.3321C7.26114 18.4219 7.28999 18.4956 7.34769 18.5533C7.40539 18.611 7.47912 18.6398 7.56887 18.6398H7.26114V5.63982Z" fill="#1C1B1B" />
                  </g>
                </svg>
              </button>
            </div>

            <button type="button" @click="addOption" class="self-start mt-2 flex items-center text-main-primary">
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_4372_14243" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="21">
                  <rect x="0.5" y="0.5" width="20" height="20" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_4372_14243)">
                  <path d="M10.5 8.41667V12.5833M12.5833 10.5H8.41667M16.75 10.5C16.75 13.9518 13.9518 16.75 10.5 16.75C7.04822 16.75 4.25 13.9518 4.25 10.5C4.25 7.04822 7.04822 4.25 10.5 4.25C13.9518 4.25 16.75 7.04822 16.75 10.5Z" stroke="#EE8444" stroke-linecap="round" stroke-linejoin="round" />
                </g>
              </svg>
              <span class="ml-1">Add Option</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div @click="toggleValuesSection" class="flex items-center gap-3 cursor-pointer mb-2">
          <span class="text-sm text-main-primary font-semibold">Value</span>
          <svg v-if="isValuesOpen" width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.55771 3.57041C1.24247 3.57041 1.02512 3.42541 0.905657 3.13542C0.78619 2.84545 0.836947 2.58997 1.05793 2.36897L2.69352 0.733397C2.76981 0.657112 2.84777 0.602701 2.92741 0.570166C3.00706 0.53763 3.094 0.521362 3.18823 0.521362C3.28246 0.521362 3.3694 0.53763 3.44904 0.570166C3.52869 0.602701 3.60667 0.657112 3.68295 0.733397L5.31852 2.36897C5.53952 2.58997 5.59028 2.84545 5.47082 3.13542C5.35134 3.42541 5.13398 3.57041 4.81877 3.57041H1.55771Z" fill="#EE8444" />
          </svg>
          <svg v-else width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.56315 3.10069L0.927557 1.46511C0.706576 1.24412 0.655819 0.988631 0.775285 0.698656C0.894752 0.408667 1.1121 0.263672 1.42734 0.263672H4.68839C5.00361 0.263672 5.22096 0.408667 5.34045 0.698656C5.45991 0.988631 5.40915 1.24412 5.18815 1.46511L3.55258 3.10069C3.47629 3.17697 3.39832 3.23138 3.31867 3.26392C3.23903 3.29645 3.15209 3.31272 3.05785 3.31272C2.96363 3.31272 2.87669 3.29645 2.79704 3.26392C2.7174 3.23138 2.63944 3.17697 2.56315 3.10069Z" fill="#EE8444" />
          </svg>
        </div>

        <div v-if="isValuesOpen">
          <select-control v-if="formData.input_type === 'select' && formData.options.length > 0" v-model="formData.value" label="Value" :options="formData.options.map(opt => ({ label: opt, value: opt }))" class="mb-4"> </select-control>
          <div v-if="formData.input_type === 'text' && formData.type === 'string'" class="mb-4">
            <span class="block text-sm font-medium mb-1">Value</span>
            <input type="text" v-model="formData.value" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" placeholder="Enter text value" />
          </div>
          <div v-if="formData.input_type === 'textarea' && formData.type === 'string'" class="mb-4">
            <span class="block text-sm font-medium mb-1">Value</span>
            <textarea v-model="formData.value" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent resize-y focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" rows="4" placeholder="Enter text content"></textarea>
          </div>

          <div v-if="formData.input_type === 'number' && ['integer', 'float'].includes(formData.type)" class="mb-4">
            <span class="block text-sm font-medium mb-1">Value</span>
            <input type="number" v-model="formData.value" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" :step="formData.type === 'float' ? 'any' : 1" placeholder="Enter number value" />
          </div>

          <div v-if="formData.input_type === 'checkbox' && formData.type === 'boolean'" class="mb-4">
            <span class="block text-sm font-medium mb-1">Value</span>
            <div class="flex items-center">
              <input type="checkbox" id="checkbox-value" v-model="formData.value" class="w-4 h-4 border-new-gray-300 rounded bg-transparent focus:ring-main-primary focus:ring-opacity-25 dark:border-new-gray-600 dark:checked:bg-main-primary dark:focus:ring-main-primary" />
              <label for="checkbox-value" class="ml-2 text-sm text-gray-700">
                {{ formData.value ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
          </div>

          <div v-if="formData.input_type === 'multi-select' && formData.type === 'array' && formData.options.length > 0" class="mb-4">
            <span class="block text-sm font-medium mb-1">Values (one per line)</span>
            <textarea v-model="arrayValueStr" @blur="updateArrayValue" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" rows="6" placeholder="Enter values, one per line"> </textarea>
          </div>

          <div v-if="formData.type === 'json'" class="mb-4">
            <span class="block text-sm font-medium mb-1">Value (JSON)</span>
            <textarea v-model="jsonValueStr" @blur="updateJsonValue" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" rows="6"> </textarea>
            <div v-if="jsonError" class="text-red-500 text-xs mt-1">{{ jsonError }}</div>
          </div>

          <div v-if="formData.type === 'array' && !['select', 'multi-select'].includes(formData.input_type)" class="mb-4">
            <span class="block text-sm font-medium mb-1">Values (one per line)</span>
            <textarea v-model="arrayValueStr" @blur="updateArrayValue" class="w-full p-2 border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" rows="6" placeholder="Enter values, one per line"> </textarea>
          </div>

          <div v-if="formData.input_type === 'dynamic' && formData.type === 'object'" class="mb-4">
            <div v-if="!addingMainSection" class="mb-4">
              <button @click="showAddMainSection" class="text-main-primary hover:text-main-primary-dark flex items-center">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-1">
                  <path d="M10.5 8.41667V12.5833M12.5833 10.5H8.41667M16.75 10.5C16.75 13.9518 13.9518 16.75 10.5 16.75C7.04822 16.75 4.25 13.9518 4.25 10.5C4.25 7.04822 7.04822 4.25 10.5 4.25C13.9518 4.25 16.75 7.04822 16.75 10.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Add Section
              </button>
            </div>

            <div v-if="addingMainSection" class="flex items-center gap-2 mb-4">
              <input type="text" v-model="newMainKeyName" placeholder="Enter main section name" class="flex-1 p-2 text-sm border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" />
              <button @click="addMainKey" class="px-4 py-2 bg-main-primary text-white rounded-md hover:bg-main-primary-dark text-sm" :disabled="!newMainKeyName" :class="{ 'opacity-50 cursor-not-allowed': !newMainKeyName }">Add</button>
              <button @click="cancelAddMainSection" class="px-4 py-2 text-red-500 hover:text-red-700 text-sm">Cancel</button>
            </div>

            <div v-for="(mainValue, mainKey) in dynamicValue" :key="mainKey" class="mb-6 pb-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium">{{ mainKey }}</h3>
                <button @click="removeMainKey(mainKey)" class="underline text-main-primary text-xs">Remove Section</button>
              </div>

              <div v-if="!addingSubKey[mainKey]" class="ml-4 mb-3">
                <button @click="showAddSubKey(mainKey)" class="text-main-primary hover:text-main-primary-dark flex items-center">
                  <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-1">
                    <path d="M10.5 8.41667V12.5833M12.5833 10.5H8.41667M16.75 10.5C16.75 13.9518 13.9518 16.75 10.5 16.75C7.04822 16.75 4.25 13.9518 4.25 10.5C4.25 7.04822 7.04822 4.25 10.5 4.25C13.9518 4.25 16.75 7.04822 16.75 10.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Add Category
                </button>
              </div>

              <div v-if="addingSubKey[mainKey]" class="ml-4 flex gap-2 items-center mb-4">
                <input type="text" v-model="newSubKeyNames[mainKey]" placeholder="Enter category name" class="flex-1 p-2 text-sm border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" />
                <button @click="addSubKey(mainKey)" class="px-4 py-1 bg-main-primary text-white rounded-md hover:bg-main-primary-dark text-sm" :disabled="!newSubKeyNames[mainKey]" :class="{ 'opacity-50 cursor-not-allowed': !newSubKeyNames[mainKey] }">Add</button>
                <button @click="cancelAddSubKey(mainKey)" class="px-4 py-1 text-red-500 hover:text-red-700 text-sm">Cancel</button>
              </div>

              <div v-for="(subArray, subKey) in mainValue" :key="subKey" class="ml-4 mb-4 pb-3 border-b border-new-gray-300">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-medium">{{ subKey }}</h4>
                  <button @click="removeSubKey(mainKey, subKey)" class="underline text-main-primary text-xs">Remove Category</button>
                </div>

                <div class="ml-4 space-y-2">
                  <div v-for="(val, valIndex) in subArray" :key="`${subKey}-${valIndex}`" class="flex items-center gap-2">
                    <input type="text" v-model="dynamicValue[mainKey][subKey][valIndex]" class="flex-1 p-2 text-sm border border-new-gray-300 rounded-md bg-transparent focus:border-main-primary focus:ring-1 focus:ring-main-primary dark:text-white dark:border-new-gray-600" />
                    <button @click="removeSubValue(mainKey, subKey, valIndex)" class="text-red-500 hover:text-red-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_41_503" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                          <rect width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_41_503)">
                          <path d="M7.56887 20.1398C7.06374 20.1398 6.63617 19.9648 6.28617 19.6148C5.93617 19.2648 5.76117 18.8372 5.76117 18.3321V5.63982H5.51117C5.29835 5.63982 5.12015 5.56803 4.97657 5.42445C4.83297 5.28087 4.76117 5.10267 4.76117 4.88985C4.76117 4.67703 4.83297 4.49883 4.97657 4.35525C5.12015 4.21165 5.29835 4.13985 5.51117 4.13985H9.26114C9.26114 3.88858 9.34896 3.67833 9.52459 3.5091C9.70024 3.33987 9.91371 3.25525 10.165 3.25525H14.3573C14.6086 3.25525 14.822 3.33987 14.9977 3.5091C15.1733 3.67833 15.2611 3.88858 15.2611 4.13985H19.0111C19.2239 4.13985 19.4021 4.21165 19.5457 4.35525C19.6893 4.49883 19.7611 4.67703 19.7611 4.88985C19.7611 5.10267 19.6893 5.28087 19.5457 5.42445C19.4021 5.56803 19.2239 5.63982 19.0111 5.63982H18.7611V18.3321C18.7611 18.8372 18.5861 19.2648 18.2361 19.6148C17.8861 19.9648 17.4586 20.1398 16.9534 20.1398H7.56887ZM7.26114 5.63982V18.3321C7.26114 18.4219 7.28999 18.4956 7.34769 18.5533C7.40539 18.611 7.47912 18.6398 7.56887 18.6398H16.9534C17.0432 18.6398 17.1169 18.611 17.1746 18.5533C17.2323 18.4956 17.2611 18.4219 17.2611 18.3321V5.63982H7.26114ZM9.66502 15.8899C9.66502 16.1027 9.73681 16.2809 9.88039 16.4244C10.024 16.568 10.2022 16.6398 10.415 16.6398C10.6278 16.6398 10.806 16.568 10.9496 16.4244C11.0932 16.2809 11.165 16.1027 11.165 15.8899V8.3898C11.165 8.17698 11.0932 7.99878 10.9496 7.8552C10.806 7.71162 10.6278 7.63982 10.415 7.63982C10.2022 7.63982 10.024 7.71162 9.88039 7.8552C9.73681 7.99878 9.66502 8.17698 9.66502 8.3898V15.8899ZM13.3573 15.8899C13.3573 16.1027 13.4291 16.2809 13.5727 16.4244C13.7163 16.568 13.8945 16.6398 14.1073 16.6398C14.3201 16.6398 14.4983 16.568 14.6419 16.4244C14.7855 16.2809 14.8573 16.1027 14.8573 15.8899V8.3898C14.8573 8.17698 14.7855 7.99878 14.6419 7.8552C14.4983 7.71162 14.3201 7.63982 14.1073 7.63982C13.8945 7.63982 13.7163 7.71162 13.5727 7.8552C13.4291 7.99878 13.3573 8.17698 13.3573 8.3898V15.8899ZM7.26114 5.63982V18.3321C7.26114 18.4219 7.28999 18.4956 7.34769 18.5533C7.40539 18.611 7.47912 18.6398 7.56887 18.6398H7.26114V5.63982Z" fill="#1C1B1B" />
                        </g>
                      </svg>
                    </button>
                  </div>

                  <button @click="addSubValue(mainKey, subKey)" class="mt-2 text-main-primary hover:text-main-primary-dark text-sm flex items-center">
                    <svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-1">
                      <path d="M10.5 8.41667V12.5833M12.5833 10.5H8.41667M16.75 10.5C16.75 13.9518 13.9518 16.75 10.5 16.75C7.04822 16.75 4.25 13.9518 4.25 10.5C4.25 7.04822 7.04822 4.25 10.5 4.25C13.9518 4.25 16.75 7.04822 16.75 10.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Add Value
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-4 p-4 border-t border-new-gray-300">
      <button @click="handleCloseClick" class="px-4 py-2 underline text-main-primary">Cancel</button>
      <button @click="saveSettings" class="px-4 py-2 bg-main-primary text-white rounded-md hover:bg-main-primary-dark" :disabled="!isValid" :class="{ 'opacity-50 cursor-not-allowed': !isValid }">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import TextControl from '../../../shared/text-control/TextControl.vue';
import SelectControl from '../../../shared/select-control/SelectControl.vue';

const props = defineProps({
  settingData: {
    type: String,
    default: '{}'
  }
});

const isEditMode = ref(false);
const isOptionsOpen = ref(true);
const isValuesOpen = ref(false);
const originalId = ref(null);
const jsonError = ref('');
const jsonValueStr = ref('{}');
const arrayValueStr = ref('');

const dynamicValue = ref({});
const newMainKeyName = ref('');
const newSubKeyNames = ref({});

const addingMainSection = ref(false);
const addingSubKey = ref({});

const formData = ref({
  name: '',
  type: 'string',
  input_type: 'text',
  options: [],
  value: []
});

const touched = ref({
  name: false,
  type: false,
  input_type: false
});

const optionTouched = ref([]);

const typeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Integer', value: 'integer' },
  { label: 'Float', value: 'float' },
  { label: 'Array', value: 'array' },
  { label: 'Object', value: 'object' },
  { label: 'JSON', value: 'json' }
];

const inputTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Select', value: 'select' },
  { label: 'Multi-select', value: 'multi-select' },
  { label: 'Number', value: 'number' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Dynamic', value: 'dynamic' }
];

const errors = computed(() => ({
  name: !formData.value.name,
  type: !formData.value.type,
  input_type: !formData.value.input_type
}));

const isValid = computed(() => {
  const basicValid = !errors.value.name && !errors.value.type && !errors.value.input_type;

  let optionsValid = true;
  if (['select', 'multi-select'].includes(formData.value.input_type)) {
    optionsValid = formData.value.options.length > 0 && formData.value.options.every(option => !!option);
  }

  return basicValid && optionsValid && !jsonError.value;
});

watch(
  () => props.settingData,
  newValue => {
    if (newValue) {
      loadSettingData(newValue);
    }
  },
  { immediate: true }
);

watch(
  () => formData.value.input_type,
  newValue => {
    updateValidators(newValue);

    if (['select', 'multi-select'].includes(newValue) && formData.value.options.length === 0) {
      addOption();
    }

    if (newValue !== 'dynamic') {
      dynamicValue.value = {};
      addingSubKey.value = {};
      addingMainSection.value = false;
    } else if (newValue === 'dynamic' && Object.keys(dynamicValue.value).length === 0) {
      dynamicValue.value = {};
      addingSubKey.value = {};
    }
  }
);

watch(
  () => formData.value.type,
  newValue => {
    updateValueFormat(newValue);
  }
);

watch(
  () => formData.value.value,
  newValue => {
    if (formData.value.type === 'json' && typeof newValue === 'object') {
      jsonValueStr.value = JSON.stringify(newValue, null, 2);
    } else if (formData.value.type === 'array' && Array.isArray(newValue) && !['select', 'multi-select'].includes(formData.value.input_type)) {
      arrayValueStr.value = newValue.join('\n');
    }
  }
);

watch(
  () => dynamicValue.value,
  newVal => {
    if (formData.value.input_type === 'dynamic' && formData.value.type === 'object') {
      formData.value.value = JSON.parse(JSON.stringify(newVal));
    }
  },
  { deep: true }
);

function parseSettingValue(value, type) {
  if (typeof value !== 'string') {
    return value;
  }

  const typeStr = getTypeString(type);

  if (['array', 'json', 'object'].includes(typeStr)) {
    return JSON.parse(value);
  }

  switch (typeStr) {
    case 'boolean':
      return value === 'true';
    case 'integer':
      return parseInt(value, 10);
    case 'float':
      return parseFloat(value);
    default:
      return value;
  }
}

function setupDynamicObject(parsedValue) {
  dynamicValue.value = JSON.parse(JSON.stringify(parsedValue));

  Object.keys(dynamicValue.value).forEach(mainKey => {
    newSubKeyNames.value[mainKey] = '';
    addingSubKey.value[mainKey] = false;
  });
}

function formatSpecialValues(formDataValue) {
  const { type, input_type, value } = formDataValue;

  if (type === 'json' && typeof value === 'object') {
    jsonValueStr.value = JSON.stringify(value, null, 2);
  }

  if (type === 'array' && Array.isArray(value) && !['select', 'multi-select'].includes(input_type)) {
    arrayValueStr.value = value.join('\n');
  }
}

function loadSettingData(settingDataString) {
  const setting = typeof settingDataString === 'string' ? JSON.parse(settingDataString) : settingDataString;

  if (!setting || !setting.id) {
    return;
  }

  isEditMode.value = true;
  originalId.value = setting.id;

  const parsedOptions = Array.isArray(setting.options) ? [...setting.options] : [];

  const parsedValue = parseSettingValue(setting.value, setting.type);

  formData.value = {
    name: setting.name || '',
    type: getTypeString(setting.type),
    input_type: setting.input_type || 'text',
    options: parsedOptions,
    value: parsedValue
  };

  if (formData.value.input_type === 'dynamic' && formData.value.type === 'object') {
    setupDynamicObject(parsedValue);
  }

  formatSpecialValues(formData.value);

  optionTouched.value = Array(formData.value.options.length).fill(false);

  if (['select', 'multi-select'].includes(formData.value.input_type) && formData.value.options.length === 0) {
    addOption();
  }
}

function updateJsonValue() {
  if (formData.value.type === 'json') {
    formData.value.value = JSON.parse(jsonValueStr.value);
    jsonError.value = '';
  }
}

function updateArrayValue() {
  if (formData.value.type === 'array' && !['select', 'multi-select'].includes(formData.value.input_type)) {
    const lines = arrayValueStr.value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    formData.value.value = lines;
  }
}

function getTypeString(typeEnum) {
  const typeMap = {
    string: 'string',
    boolean: 'boolean',
    integer: 'integer',
    float: 'float',
    array: 'array',
    object: 'object',
    json: 'json'
  };

  return typeMap[String(typeEnum).toLowerCase()] || 'array';
}

function updateValidators(inputType) {
  optionTouched.value = Array(formData.value.options.length).fill(false);

  if (['select', 'multi-select'].includes(inputType) && formData.value.options.length === 0) {
    addOption();
  }
}

function updateValueFormat(type) {
  switch (type) {
    case 'boolean':
      formData.value.value = false;
      break;
    case 'integer':
    case 'float':
      formData.value.value = 0;
      break;
    case 'array':
      formData.value.value = [];
      if (!['select', 'multi-select'].includes(formData.value.input_type)) {
        arrayValueStr.value = '';
      }
      break;
    case 'object':
      if (formData.value.input_type === 'dynamic') {
        formData.value.value = Object.keys(dynamicValue.value).length > 0 ? JSON.parse(JSON.stringify(dynamicValue.value)) : {};
      } else {
        formData.value.value = {};
      }
      break;
    case 'json':
      formData.value.value = {};
      jsonValueStr.value = '{}';
      break;
    case 'string':
    default:
      formData.value.value = '';
  }
}

function addOption() {
  formData.value.options.push('');
  optionTouched.value.push(false);
}

function removeOption(index) {
  if (formData.value.options.length <= 1 && ['select', 'multi-select'].includes(formData.value.input_type)) {
    return;
  }

  const removedOptionValue = formData.value.options[index];
  formData.value.options.splice(index, 1);
  optionTouched.value.splice(index, 1);

  if (formData.value.input_type === 'multi-select' && Array.isArray(formData.value.value) && formData.value.value.includes(removedOptionValue)) {
    formData.value.value = formData.value.value.filter(val => val !== removedOptionValue);
  }
}

function toggleOptionsSection() {
  isOptionsOpen.value = !isOptionsOpen.value;
}

function toggleValuesSection() {
  isValuesOpen.value = !isValuesOpen.value;
}

function showAddMainSection() {
  addingMainSection.value = true;
  newMainKeyName.value = '';
}

function cancelAddMainSection() {
  addingMainSection.value = false;
  newMainKeyName.value = '';
}

function showAddSubKey(mainKey) {
  addingSubKey.value[mainKey] = true;
  newSubKeyNames.value[mainKey] = '';
}

function cancelAddSubKey(mainKey) {
  addingSubKey.value[mainKey] = false;
  newSubKeyNames.value[mainKey] = '';
}

function addMainKey() {
  if (!newMainKeyName.value || newMainKeyName.value.trim() === '') return;

  if (!dynamicValue.value[newMainKeyName.value]) {
    dynamicValue.value[newMainKeyName.value] = {};
    newSubKeyNames.value[newMainKeyName.value] = '';
    addingSubKey.value[newMainKeyName.value] = false;
  }

  newMainKeyName.value = '';
  addingMainSection.value = false;
}

function removeMainKey(mainKey) {
  const rest = { ...dynamicValue.value };
  delete rest[mainKey];
  dynamicValue.value = rest;

  const restSub = { ...newSubKeyNames.value };
  delete restSub[mainKey];
  newSubKeyNames.value = restSub;

  const restAddingSub = { ...addingSubKey.value };
  delete restAddingSub[mainKey];
  addingSubKey.value = restAddingSub;
}

function addSubKey(mainKey) {
  const subKeyName = newSubKeyNames.value[mainKey];

  if (!subKeyName || subKeyName.trim() === '') return;

  if (!dynamicValue.value[mainKey][subKeyName]) {
    dynamicValue.value[mainKey][subKeyName] = [];
    addSubValue(mainKey, subKeyName);
  }

  newSubKeyNames.value[mainKey] = '';
  addingSubKey.value[mainKey] = false;
}

function removeSubKey(mainKey, subKey) {
  const rest = { ...dynamicValue.value[mainKey] };
  delete rest[subKey];
  dynamicValue.value[mainKey] = rest;
}

function addSubValue(mainKey, subKey) {
  if (!dynamicValue.value[mainKey][subKey]) {
    dynamicValue.value[mainKey][subKey] = [];
  }
  dynamicValue.value[mainKey][subKey].push('');
}

function removeSubValue(mainKey, subKey, valueIndex) {
  dynamicValue.value[mainKey][subKey].splice(valueIndex, 1);

  if (dynamicValue.value[mainKey][subKey].length === 0) {
    addSubValue(mainKey, subKey);
  }
}

function markFormAsTouched() {
  touched.value = {
    name: true,
    type: true,
    input_type: true
  };
  optionTouched.value = Array(formData.value.options.length).fill(true);
}

function handleCloseClick() {
  const event = new CustomEvent('dialog-closed', {
    bubbles: true,
    composed: true
  });
  window.dispatchEvent(event);
}

function processValueByType(inputValue, type) {
  switch (type) {
    case 'boolean':
      return !!inputValue;
    case 'integer':
      return parseInt(inputValue, 10) || 0;
    case 'float':
      return parseFloat(inputValue) || 0;
    case 'array':
      return Array.isArray(inputValue) ? inputValue : [];
    case 'object':
    case 'json':
      return typeof inputValue === 'object' ? inputValue : JSON.parse(inputValue);
    default:
      return String(inputValue || '');
  }
}

function formatValueForSending(value, type) {
  return ['array', 'json', 'object'].includes(type) ? JSON.stringify(value) : value.toString();
}

function createSettingData(formData, processedValue, isEditMode, originalId) {
  const typeEnum = getApplicationSettingType(formData.type);
  const options = formData.options.filter(option => !!option);

  const settingData = {
    name: formData.name,
    type: typeEnum,
    input_type: formData.input_type,
    value: formatValueForSending(processedValue, formData.type),
    options: options
  };

  if (isEditMode && originalId) {
    settingData.id = originalId;
  }

  return settingData;
}

function saveSettings() {
  if (!isValid.value) {
    markFormAsTouched();
    return;
  }

  let processedValue;
  if (formData.value.input_type === 'dynamic' && formData.value.type === 'object') {
    processedValue = JSON.parse(JSON.stringify(dynamicValue.value));
  } else {
    processedValue = processValueByType(formData.value.value, formData.value.type);
  }

  const settingData = createSettingData(formData.value, processedValue, isEditMode.value, originalId.value);

  const event = new CustomEvent('save-setting', {
    detail: JSON.stringify(settingData),
    bubbles: true,
    composed: true
  });
  window.dispatchEvent(event);
}

function getApplicationSettingType(typeString) {
  return typeString.toLowerCase();
}

onBeforeUnmount(() => {
  window.removeEventListener('save-setting');
  window.removeEventListener('dialog-closed');
});
</script>
