import React from 'react';
import { 
  Activity, Server, Database, Shield, Zap, Code, 
  Cpu, Globe, Layers, Lock, Terminal, Clock,
  BookOpen, GitBranch, Key, Search, Settings, Cloud,
  AlertTriangle, TrendingUp, CheckCircle,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Activity, Server, Database, Shield, Zap, Code, 
  Cpu, Globe, Layers, Lock, Terminal, Clock,
  BookOpen, GitBranch, Key, Search, Settings, Cloud,
  AlertTriangle, TrendingUp, CheckCircle
};

interface IconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, className }) => {
  const IconComponent = (name && iconMap[name]) ? iconMap[name] : Layers; // Default to Layers
  return <IconComponent className={className} />;
};
