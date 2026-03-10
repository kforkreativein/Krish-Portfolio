import { motion } from 'framer-motion'

const sizeClasses = {
  sm: 'px-[18px] py-[9px] text-[11px]',
  md: 'px-[20px] py-[13px] text-[13px]',
  lg: 'px-[28px] py-[15px] text-[14px]',
}

const variantClasses = {
  primary: 'bg-accent font-[700] shadow-md hover:opacity-80 border-transparent transition-opacity',
  ghost: 'bg-transparent border hover:bg-black/5 dark:hover:bg-white/5 font-[700] transition-all',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  icon,
  children,
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full font-body outline-none min-h-[44px]',
    'transition-colors duration-200',
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].join(' ')

  const dynamicStyle = {
    color: variant === 'ghost' ? 'var(--btn-normal-text)' : 'var(--btn-colored-text)',
    borderColor: variant === 'ghost' ? 'var(--btn-normal-text)' : undefined,
    ...props.style,
  }

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }

  // To support icon hover animation effectively
  const renderContent = () => (
    <>
      <span className="relative z-10 flex items-center justify-center whitespace-nowrap">
        {children}
      </span>
      {icon && (
        <motion.span
          className="flex items-center relative z-10"
          initial={{ x: 0, y: 0 }}
          variants={{
            hover: { x: 3, y: -3 } // Subtle top-right push
          }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
      )}
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        initial="initial"
        whileHover="hover"
        {...motionProps}
        {...props}
        style={dynamicStyle}
      >
        {renderContent()}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      className={classes}
      initial="initial"
      whileHover="hover"
      {...motionProps}
      {...props}
      style={dynamicStyle}
    >
      {renderContent()}
    </motion.button>
  )
}
