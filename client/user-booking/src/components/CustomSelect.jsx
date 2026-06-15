import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, MapPin, Bus, Check } from 'lucide-react';

/**
 * CustomSelect — A premium, searchable dropdown component.
 *
 * Props:
 *  - value        : current selected value (string | number)
 *  - onChange      : callback(value) when an option is picked
 *  - options       : [{ value, label, sublabel? }]
 *  - placeholder   : placeholder text
 *  - icon          : optional leading icon element (e.g. <MapPin />)
 *  - label         : optional label rendered above the field
 *  - disabled      : boolean
 *  - searchable    : boolean (default true)
 *  - variant       : 'default' | 'dark' | 'minimal' — visual theme
 *  - className     : extra class for the outermost wrapper
 *  - dropUp        : boolean — open upward
 *  - name          : optional field name (useful for forms)
 */
export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Select…',
    icon = null,
    label = null,
    disabled = false,
    searchable = true,
    variant = 'default',
    className = '',
    dropUp = false,
    name = '',
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const wrapperRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto-focus search when opened
    useEffect(() => {
        if (open && searchable && searchRef.current) {
            searchRef.current.focus();
        }
        if (open) setHighlightIdx(-1);
    }, [open, searchable]);

    // Filter options
    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase();
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                (o.sublabel && o.sublabel.toLowerCase().includes(q))
        );
    }, [options, query]);

    // Scroll highlighted into view
    useEffect(() => {
        if (highlightIdx >= 0 && listRef.current) {
            const el = listRef.current.children[highlightIdx];
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIdx]);

    const selectedOption = options.find((o) => String(o.value) === String(value));

    const handleSelect = (val) => {
        onChange(val);
        setOpen(false);
        setQuery('');
    };

    const handleKeyDown = (e) => {
        if (!open) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightIdx >= 0 && filtered[highlightIdx]) {
                    handleSelect(filtered[highlightIdx].value);
                }
                break;
            case 'Escape':
                setOpen(false);
                setQuery('');
                break;
            default:
                break;
        }
    };

    /* ── Theme variants ────────────────────────────────── */
    const themes = {
        default: {
            wrapper: 'cs-wrapper cs-default',
            trigger: 'cs-trigger',
            dropdown: 'cs-dropdown',
        },
        dark: {
            wrapper: 'cs-wrapper cs-dark',
            trigger: 'cs-trigger cs-trigger--dark',
            dropdown: 'cs-dropdown cs-dropdown--dark',
        },
        minimal: {
            wrapper: 'cs-wrapper cs-minimal',
            trigger: 'cs-trigger cs-trigger--minimal',
            dropdown: 'cs-dropdown',
        },
    };
    const theme = themes[variant] || themes.default;

    return (
        <div
            ref={wrapperRef}
            className={`${theme.wrapper} ${className} ${disabled ? 'cs-disabled' : ''}`}
            onKeyDown={handleKeyDown}
        >
            {label && <span className="cs-label">{label}</span>}

            {/* Trigger */}
            <button
                type="button"
                className={`${theme.trigger} ${open ? 'cs-open' : ''}`}
                onClick={() => !disabled && setOpen((v) => !v)}
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
            >
                <span className="cs-trigger__left">
                    {icon && <span className="cs-trigger__icon">{icon}</span>}
                    <span className={`cs-trigger__text ${!selectedOption ? 'cs-placeholder' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </span>
                <ChevronDown className={`cs-trigger__chevron ${open ? 'cs-chevron--open' : ''}`} size={18} />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className={`${theme.dropdown} ${dropUp ? 'cs-dropdown--up' : ''}`}>
                    {/* Search bar */}
                    {searchable && (
                        <div className="cs-search">
                            <Search className="cs-search__icon" size={16} />
                            <input
                                ref={searchRef}
                                className="cs-search__input"
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setHighlightIdx(0);
                                }}
                                placeholder="Tìm kiếm..."
                            />
                            {query && (
                                <button className="cs-search__clear" onClick={() => setQuery('')} type="button">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Option list */}
                    <ul className="cs-options" ref={listRef} role="listbox">
                        {filtered.length === 0 && (
                            <li className="cs-empty">Không tìm thấy kết quả</li>
                        )}
                        {filtered.map((opt, idx) => {
                            const isSelected = String(opt.value) === String(value);
                            const isHighlighted = idx === highlightIdx;
                            return (
                                <li
                                    key={opt.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`cs-option ${isSelected ? 'cs-option--selected' : ''} ${isHighlighted ? 'cs-option--highlighted' : ''}`}
                                    onClick={() => handleSelect(opt.value)}
                                    onMouseEnter={() => setHighlightIdx(idx)}
                                >
                                    <span className="cs-option__content">
                                        {opt.icon && <span className="cs-option__icon">{opt.icon}</span>}
                                        <span className="cs-option__label">{opt.label}</span>
                                        {opt.sublabel && <span className="cs-option__sub">{opt.sublabel}</span>}
                                    </span>
                                    {isSelected && <Check size={16} className="cs-option__check" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
