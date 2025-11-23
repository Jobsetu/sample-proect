import React from 'react'
import { Briefcase } from 'lucide-react'

const Logo = ({ size = 'md', showText = true, className = '' }) => {
    const sizes = {
        sm: { icon: 'w-6 h-6', text: 'text-lg' },
        md: { icon: 'w-8 h-8', text: 'text-2xl' },
        lg: { icon: 'w-10 h-10', text: 'text-3xl' }
    }

    const currentSize = sizes[size] || sizes.md

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Logo Icon - Bridge/Connection concept */}
            <div className="relative">
                <div className={`${currentSize.icon} rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center`}>
                    <Briefcase className="w-1/2 h-1/2 text-white" />
                </div>
                {/* Subtle glow effect */}
                <div className={`absolute inset-0 ${currentSize.icon} rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 blur-sm opacity-50 -z-10`} />
            </div>

            {/* Text */}
            {showText && (
                <span className={`${currentSize.text} font-bold text-white`}>
                    Job<span className="gradient-text">Setu</span>
                </span>
            )}
        </div>
    )
}

export default Logo
