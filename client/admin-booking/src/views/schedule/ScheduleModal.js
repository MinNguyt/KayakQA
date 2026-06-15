import React, { useEffect, useMemo, useState } from 'react'
import { vehicleSchedulesAPI } from '../../lib/Api'

// Align with backend: routeId, busId, isActive (boolean), departureTime
const defaultForm = { routeId: '', busId: '', isActive: true, departureTime: '' }

const ScheduleModal = ({ open, onClose, onSaved, initialData, routes = [], cars = [] }) => {
    const [form, setForm] = useState(defaultForm)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (initialData) {
            setForm({
                routeId: initialData.routeId || '',
                busId: initialData.busId || '',
                isActive: initialData.isActive ?? true,
                departureTime: initialData.departureTime ? new Date(initialData.departureTime).toISOString().slice(0, 16) : '',
            })
        } else {
            setForm(defaultForm)
        }
    }, [initialData])

    const submit = async (e) => {
        e?.preventDefault?.()
        setSubmitting(true)
        setError('')
        try {
            const payload = {
                routeId: Number(form.routeId),
                busId: Number(form.busId),
                isActive: Boolean(form.isActive),
                departureTime: form.departureTime ? new Date(form.departureTime).toISOString() : null,
            }
            const data = initialData?.id
                ? await vehicleSchedulesAPI.updateSchedule(initialData.id, payload)
                : await vehicleSchedulesAPI.createSchedule(payload)
            if (data?.success === false) throw new Error(data?.message || 'Lỗi lưu lịch trình')
            onSaved?.()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{initialData ? 'Cập nhật lịch trình' : 'Thêm lịch trình'}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}

                            <div className="mb-3">
                                <label className="form-label">Tuyến</label>
                                <select className="form-select" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))} required>
                                    <option value="">Chọn tuyến</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {(r.departureStation.name || 'N/A') + ' → ' + (r.arrivalStation.name || 'N/A')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Xe</label>
                                <select className="form-select" value={form.busId} onChange={e => setForm(f => ({ ...f, busId: e.target.value }))} required>
                                    <option value="">Chọn xe</option>
                                    {cars.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Thời gian khởi hành</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={form.departureTime}
                                    onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-check mb-3">
                                <input className="form-check-input" type="checkbox" id="isActiveCheck" checked={!!form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                                <label className="form-check-label" htmlFor="isActiveCheck">
                                    Kích hoạt
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Đóng</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ScheduleModal
