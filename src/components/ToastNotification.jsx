import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

const ToastNotification = ({ type = 'success', message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-500/90',
            iconColor: 'text-white',
            borderColor: 'border-green-400'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-500/90',
            iconColor: 'text-white',
            borderColor: 'border-red-400'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-500/90',
            iconColor: 'text-white',
            borderColor: 'border-blue-400'
        }
    }

    const { icon: Icon, bgColor, iconColor, borderColor } = config[type] || config.success

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed top-4 right-4 z-50 ${bgColor} backdrop-blur-lg border ${borderColor} rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-[500px]`}
        >
            <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} />
            <p className="text-white font-medium flex-1">{message}</p>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
            >
                <X className="w-5 h-5" />
            </button>
        </motion.div>
    )
}

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <AnimatePresence>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ top: `${index * 80 + 16}px` }} className="fixed right-4 z-50">
                    <ToastNotification
                        type={toast.type}
                        message={toast.message}
                        onClose={() => removeToast(toast.id)}
                        duration={toast.duration}
                    />
                </div>
            ))}
        </AnimatePresence>
    )
}

export default ToastNotification
