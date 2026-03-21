package com.rootlink.service;

import com.rootlink.dao.NotificationDAO;
import com.rootlink.dao.ServiceBookingDAO;
import com.rootlink.dao.ServiceDAO;
import com.rootlink.dto.ServiceBookingDTO;
import com.rootlink.dto.ServiceDTO;
import com.rootlink.exception.ForbiddenException;
import com.rootlink.exception.ResourceNotFoundException;
import com.rootlink.model.Service;
import com.rootlink.model.ServiceBooking;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceDAO serviceDAO;
    private final ServiceBookingDAO bookingDAO;
    private final NotificationDAO notificationDAO;

    public ServiceService(ServiceDAO serviceDAO, ServiceBookingDAO bookingDAO,
                          NotificationDAO notificationDAO) {
        this.serviceDAO = serviceDAO;
        this.bookingDAO = bookingDAO;
        this.notificationDAO = notificationDAO;
    }

    // ── UC-09: Post Service Listing ──────────────────────────

    @Transactional
    public ServiceDTO create(ServiceDTO dto, Long providerId) {
        Service service = new Service();
        service.setTitle(dto.getTitle());
        service.setDescription(dto.getDescription());
        service.setType(dto.getType());
        service.setTags(dto.getTags());
        service.setImageUrl(dto.getImageUrl());
        service.setLocation(dto.getLocation());
        service.setProviderId(providerId);

        Long newId = serviceDAO.insert(service);
        service.setId(newId);
        return ServiceDTO.from(service);
    }

    // ── UC-10: Search Services ───────────────────────────────

    @Transactional(readOnly = true)
    public List<ServiceDTO> findFiltered(String type, String location, String tags) {
        return serviceDAO.findFiltered(type, location, tags)
                .stream()
                .map(ServiceDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceDTO findById(Long id) {
        Service service = serviceDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return ServiceDTO.from(service);
    }

    @Transactional
    public ServiceDTO update(Long serviceId, ServiceDTO dto, Long requestingUserId) {
        Service service = requireProviderAccess(serviceId, requestingUserId);
        service.setTitle(dto.getTitle());
        service.setDescription(dto.getDescription());
        service.setType(dto.getType());
        service.setTags(dto.getTags());
        service.setImageUrl(dto.getImageUrl());
        service.setLocation(dto.getLocation());
        serviceDAO.update(service);
        return ServiceDTO.from(service);
    }

    @Transactional
    public void delete(Long serviceId, Long requestingUserId) {
        requireProviderAccess(serviceId, requestingUserId);
        serviceDAO.deleteById(serviceId);
    }

    // ── Book a Service ───────────────────────────────────────

    @Transactional
    public ServiceBookingDTO book(Long serviceId, Long userId, LocalDateTime bookedTime) {
        serviceDAO.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceId));

        ServiceBooking booking = new ServiceBooking();
        booking.setUserId(userId);
        booking.setServiceId(serviceId);
        booking.setBookedTime(bookedTime);

        Long newId = bookingDAO.insert(booking);
        booking.setId(newId);
        booking.setStatus("PENDING");

        // Notify provider
        com.rootlink.model.Service svc = serviceDAO.findById(serviceId).get();
        notificationDAO.insert(svc.getProviderId(), "BOOKING_REQUEST",
                "You have a new booking request for your service: " + svc.getTitle());

        return ServiceBookingDTO.from(booking);
    }

    // ── Approve / Decline Booking ────────────────────────────

    @Transactional
    public void approveBooking(Long bookingId, Long requestingUserId) {
        ServiceBooking booking = bookingDAO.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        requireBookingProviderAccess(booking, requestingUserId);
        bookingDAO.updateStatus(bookingId, "APPROVED");

        notificationDAO.insert(booking.getUserId(), "BOOKING_APPROVED",
                "Your booking request has been approved!");
    }

    @Transactional
    public void declineBooking(Long bookingId, Long requestingUserId) {
        ServiceBooking booking = bookingDAO.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        requireBookingProviderAccess(booking, requestingUserId);
        bookingDAO.updateStatus(bookingId, "DECLINED");

        notificationDAO.insert(booking.getUserId(), "BOOKING_DECLINED",
                "Your booking request was declined.");
    }

    // ── Helpers ──────────────────────────────────────────────

    private Service requireProviderAccess(Long serviceId, Long userId) {
        Service service = serviceDAO.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceId));
        if (!service.getProviderId().equals(userId)) {
            throw new ForbiddenException("Only the service provider can perform this action.");
        }
        return service;
    }

    private void requireBookingProviderAccess(ServiceBooking booking, Long userId) {
        Service service = serviceDAO.findById(booking.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found."));
        if (!service.getProviderId().equals(userId)) {
            throw new ForbiddenException("Only the service provider can manage this booking.");
        }
    }
}