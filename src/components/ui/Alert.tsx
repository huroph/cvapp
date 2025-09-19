import { type ReactNode } from 'react';

interface AlertProps {
  variant: 'information' | 'important';
  title: string;
  children: ReactNode;
}

const variants = {
  information: {
    container: 'rounded-md bg-blue-50 p-4',
    icon: 'h-5 w-5 text-blue-400',
    title: 'text-sm font-medium text-blue-800',
    content: 'mt-2 text-sm text-blue-700',
    iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
  },
  important: {
    container: 'rounded-md bg-yellow-50 p-4',
    icon: 'h-5 w-5 text-yellow-400',
    title: 'text-sm font-medium text-yellow-800',
    content: 'mt-2 text-sm text-yellow-700',
    iconPath: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z'
  }
};

export default function Alert({ variant, title, children }: AlertProps) {
  const styles = variants[variant];

  return (
    <div className={styles.container}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}