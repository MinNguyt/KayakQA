import React, { useEffect, useMemo, useState } from 'react'
import ScheduleModal from './ScheduleModal'
import { routesAPI, carsAPI, vehicleSchedulesAPI } from '../../lib/Api'

const ScheduleManagement = () => {
    const [schedules, setSchedules] = useState([])
    const [routes, setRoutes] = useState([])
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const routeMap = useMemo(() => {
        const map = new Map()
        routes.forEach(r => {
            const label = `${r.departureStation.name || 'N/A'} → ${r.arrivalStation.name || 'N/A'}`
            map.set(r.id, label)
        })
        return map
    }, [routes])

    const carMap = useMemo(() => {
        const map = new Map()
        cars.forEach(c => {
            map.set(c.id, { name: c.name, featured_image: c.featured_image })
        })
        return map
    }, [cars])

    const fetchAll = async () => {
        setLoading(true)
        setError('')
        try {
            const [schRes, routeRes, carRes] = await Promise.all([
                vehicleSchedulesAPI.getSchedules({ limit: 50 }),
                routesAPI.getRoutes({ limit: 100 }),
                carsAPI.getCars({ limit: 100 }),
            ])
            console.log('res', schRes, routeRes, carRes)
            const schData = schRes?.data?.results || schRes?.results || []
            const rData = routeRes?.data?.routes || routeRes?.routes || []
            const cData = carRes?.data?.content || carRes?.content || []

            setSchedules(schData)
            setRoutes(rData)
            setCars(cData)
        } catch (e) {
            setError('Không thể tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        fetchAll()
    }, [])

    const openCreate = () => { setEditing(null); setModalOpen(true) }
    const openEdit = (item) => { setEditing(item); setModalOpen(true) }
    const onClose = () => setModalOpen(false)
    const onSaved = async () => { setModalOpen(false); await fetchAll() }

    const handleDelete = async (id) => {
        const ok = window.confirm('Bạn có chắc muốn xóa lịch trình này?\nThao tác sẽ xóa cả vé và thanh toán liên quan.')
        if (!ok) return
        setLoading(true)
        setError('')
        try {
            await vehicleSchedulesAPI.deleteSchedule(id)
            await fetchAll()
        } catch (e) {
            setError('Xóa lịch trình thất bại')
        } finally {
            setLoading(false)
        }
    }


    console.log(cars, routes)
    return (
        <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="mb-0">Quản lý lịch trình</h2>
                <button className="btn btn-primary" onClick={openCreate}>Thêm lịch trình</button>
            </div>

            {loading && <div>Đang tải...</div>}
            {error && <div className="text-danger">{error}</div>}

            {!loading && (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tuyến</th>
                                <th>Xe</th>
                                <th>Khởi hành</th>

                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((s) => {
                                const routeLabel = routeMap.get(s.routeId) || s.routeId
                                const carInfo = carMap.get(s.busId)
                                const dt = s.departureTime ? new Date(s.departureTime) : null
                                const formatted = dt && !Number.isNaN(dt.getTime())
                                    ? `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`
                                    : '—'
                                return (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{routeLabel}</td>
                                        <td>{carInfo?.name || s.busId}</td>
                                        <td>{formatted}</td>
                                        <td>{s.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(s)}>Sửa</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <ScheduleModal
                    open={modalOpen}
                    onClose={onClose}
                    onSaved={onSaved}
                    initialData={editing}
                    routes={routes}
                    cars={cars}
                />
            )}
        </div>
    )
}

export default ScheduleManagement


