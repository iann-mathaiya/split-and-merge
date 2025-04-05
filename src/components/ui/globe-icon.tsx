export default function GlobeIcon() {
    return (
        <svg viewBox="0 0 80 80" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="size-10">
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
