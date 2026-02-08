/**
 * Simple client-side toast notifications
 * Can be replaced with a proper toast library in the future
 */

export function showErrorToast(message: string) {
  // For now, use a styled alert that's better than default
  // In production, this would be replaced with a proper toast component
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md";
  errorDiv.innerHTML = `
    <div class="flex items-start">
      <svg class="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="font-medium">Error</p>
        <p class="text-sm mt-1">${message}</p>
      </div>
    </div>
  `;

  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

export function showSuccessToast(message: string) {
  const successDiv = document.createElement("div");
  successDiv.className =
    "fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md";
  successDiv.innerHTML = `
    <div class="flex items-start">
      <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="font-medium">Success</p>
        <p class="text-sm mt-1">${message}</p>
      </div>
    </div>
  `;

  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}
