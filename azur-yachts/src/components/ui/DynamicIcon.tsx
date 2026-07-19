import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Try to find the icon in lucide-react exports
  const IconComponent = (LucideIcons as any)[name] as React.FC<LucideProps>;

  if (!IconComponent) {
    // Fallback if icon is not found
    const FallbackIcon = LucideIcons.Check;
    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export const AVAILABLE_ICONS = [
  'Tent', 'ShowerHead', 'Grid2X2', 'Speaker', 'Grip', 'List', 'Shield', 
  'Square', 'LayoutTemplate', 'Thermometer', 'Droplets', 'AirVent', 
  'Layers', 'Usb', 'Wifi', 'LifeBuoy', 'Anchor', 'Compass', 'Navigation', 
  'Radio', 'Activity', 'Map', 'Flame', 'Coffee', 'Snowflake', 'Video', 
  'Waves', 'Fish', 'Glasses', 'Settings', 'Sailboat', 'Battery', 'Sun', 
  'Plug', 'Check', 'Star', 'Heart', 'Car', 'Camera', 'Tv', 'Music',
  'Wine', 'Utensils', 'Wind', 'Cloud', 'Umbrella'
];
