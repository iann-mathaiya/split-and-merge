type IconProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
};

//Placeholder Logo
export function GlobeIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className} {...props}>
            <title>Globe Icon</title>
            <mask id=":r52:" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
                <rect width="80" height="80" rx="160" fill="#FFFFFF" />
            </mask>
            <g mask="url(#:r52:)">
                <rect width="80" height="80" fill="#1c2130" />
                <path filter="url(#filter_:r52:)" d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z" fill="#028f76" transform="translate(6 6) rotate(270 40 40) scale(1.3)" />
                <path filter="url(#filter_:r52:)" d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z" fill="#b3e099" transform="translate(-1 -1) rotate(-225 40 40) scale(1.3)" style={{ mixBlendMode: "overlay" }} />
            </g>
            <defs>
                <filter id="filter_:r52:" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
                </filter>
            </defs>
        </svg>
    );
}

export function ScissorsIcon({ className, ...props }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...props}>
            <title>Scissors Icon</title>
            <path d="M9.44618 8.02867L12 10.5825L18.7279 3.85457C19.509 3.07352 20.7753 3.07352 21.5563 3.85457L9.44618 15.9647C9.79807 16.5603 10 17.2549 10 17.9967C10 20.2058 8.20914 21.9967 6 21.9967C3.79086 21.9967 2 20.2058 2 17.9967C2 15.7876 3.79086 13.9967 6 13.9967C6.74181 13.9967 7.43645 14.1986 8.03197 14.5505L10.5858 11.9967L8.03197 9.44289C7.43645 9.79478 6.74181 9.9967 6 9.9967C3.79086 9.9967 2 8.20584 2 5.9967C2 3.78756 3.79086 1.9967 6 1.9967C8.20914 1.9967 10 3.78756 10 5.9967C10 6.73851 9.79807 7.43316 9.44618 8.02867ZM14.8255 13.408L21.5563 20.1388C20.7753 20.9199 19.509 20.9199 18.7279 20.1388L13.4113 14.8222L14.8255 13.408ZM7.41421 16.5825C7.05228 16.2206 6.55228 15.9967 6 15.9967C4.89543 15.9967 4 16.8921 4 17.9967C4 19.1013 4.89543 19.9967 6 19.9967C7.10457 19.9967 8 19.1013 8 17.9967C8 17.4444 7.77614 16.9444 7.41421 16.5825ZM7.41421 7.41092C7.77614 7.04899 8 6.54899 8 5.9967C8 4.89213 7.10457 3.9967 6 3.9967C4.89543 3.9967 4 4.89213 4 5.9967C4 7.10127 4.89543 7.9967 6 7.9967C6.55228 7.9967 7.05228 7.77285 7.41421 7.41092Z" />
        </svg>
    );
}

export function MergeIcon({ className, ...props }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...props}>
            <title>Merge Icon</title>
            <path d="M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20ZM11 5H5V10.999H7V9L10 12L7 15V13H5V19H11V17H13V19H19V13H17V15L14 12L17 9V10.999H19V5H13V7H11V5ZM13 13V15H11V13H13ZM13 9V11H11V9H13Z" />
        </svg>
    );
}

export function ScanIcon({ className, ...props }: IconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} {...props}>
            <title>Scan Icon</title>
            <path d="M21 16V21H3V16H5V19H19V16H21ZM3 11H21V13H3V11ZM21 8H19V5H5V8H3V3H21V8Z" />
        </svg>
    );
}