import { createAvatar } from '@dicebear/core'
import { avataaars, bottts, identicon, initials, lorelei, micah, personas, shapes } from '@dicebear/collection'
import { useMemo } from 'react'

const Avatar = ({ 
  name, 
  email, 
  size = 40, 
  style = 'avataaars',
  className = '',
  ...props 
}) => {
  const avatarUrl = useMemo(() => {
    const seed = name || email || 'default'
    
    // Choose the avatar style
    let avatarStyle
    switch (style) {
      case 'bottts':
        avatarStyle = bottts
        break
      case 'identicon':
        avatarStyle = identicon
        break
      case 'initials':
        avatarStyle = initials
        break
      case 'lorelei':
        avatarStyle = lorelei
        break
      case 'micah':
        avatarStyle = micah
        break
      case 'personas':
        avatarStyle = personas
        break
      case 'shapes':
        avatarStyle = shapes
        break
      default:
        avatarStyle = avataaars
    }

    return createAvatar(avatarStyle, {
      seed: seed,
      size: size,
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      ...props
    }).toDataUri()
  }, [name, email, size, style, props])

  return (
    <img
      src={avatarUrl}
      alt={name || 'Avatar'}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default Avatar
