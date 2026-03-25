import type { ImgHTMLAttributes } from 'react';
import mapilesIcon from '../../assets/mapiles-icon.png';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={mapilesIcon}
            alt={props.alt ?? 'Mapiles logo'}
            className={props.className ?? 'h-8 w-8'}
        />
    );
}
