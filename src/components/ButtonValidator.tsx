
import React, { useEffect } from 'react';

interface ButtonValidatorProps {
  children: React.ReactNode;
}

export const ButtonValidator: React.FC<ButtonValidatorProps> = ({ children }) => {
  useEffect(() => {
    // Function to validate all buttons on the page
    const validateButtons = () => {
      const buttons = document.querySelectorAll('button');
      const buttonValidationResults: { element: HTMLButtonElement; hasHandler: boolean; isAccessible: boolean }[] = [];

      buttons.forEach((button) => {
        // Check if button has click handler
        const hasHandler = button.onclick !== null || 
                          button.getAttribute('onclick') !== null ||
                          button.addEventListener.length > 0;
        
        // Check accessibility
        const isAccessible = button.hasAttribute('aria-label') || 
                           button.textContent?.trim() !== '' ||
                           button.querySelector('span, svg') !== null;

        buttonValidationResults.push({
          element: button,
          hasHandler,
          isAccessible
        });

        // Add visual indicator for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          if (!hasHandler) {
            button.style.border = '2px solid red';
            button.title = 'Button missing click handler';
          }
          if (!isAccessible) {
            button.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
          }
        }
      });

      // Log results in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Button Validation Results:', buttonValidationResults);
      }
    };

    // Run validation after component mount and on DOM changes
    const timeout = setTimeout(validateButtons, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  return <>{children}</>;
};
