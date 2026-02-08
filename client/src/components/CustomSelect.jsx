import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ label, value, onChange, options, placeholder = "Select option", required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div style={{ marginBottom: '12px' }} ref={containerRef}>
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                }}>
                    {label} {required && '*'}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                {/* Trigger Button */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: isOpen ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-input)',
                        color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? '0 0 0 3px var(--brand-light)' : 'none',
                        minHeight: '38px' // Match input height roughly
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={16} style={{
                        color: 'var(--text-secondary)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                    }} />
                </div>

                {/* Dropdown Menu */}
                <div className={`custom-select-dropdown ${isOpen ? 'open' : ''}`} style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 50,
                    padding: '4px'
                }}>
                    {options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="custom-select-option"
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: option.value === value ? 'var(--brand-primary)' : 'var(--text-primary)',
                                    backgroundColor: option.value === value ? 'var(--brand-light)' : 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.1s ease'
                                }}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check size={14} />}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No options available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
