package com.cafe.mark1.Service;

import com.cafe.mark1.Dto.Request.CustomerRequest;
import com.cafe.mark1.Dto.Response.CustomerResponse;
import com.cafe.mark1.Repository.CustomerRepository;
import com.cafe.mark1.model.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getCustomers(String search) {
        List<Customer> customers = search == null || search.trim().isEmpty()
                ? customerRepository.findAll()
                : customerRepository.searchCustomers(search.trim());

        return customers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return toDto(customer);
    }

    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return toDto(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Customer phone already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();

        return toDto(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customerRepository.findByPhone(request.getPhone())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Customer phone already exists");
                });

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());

        return toDto(customerRepository.save(customer));
    }

    public CustomerResponse toggleArchive(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setIsArchived(!Boolean.TRUE.equals(customer.getIsArchived()));
        return toDto(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        customerRepository.delete(customer);
    }

    private CustomerResponse toDto(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .isArchived(Boolean.TRUE.equals(customer.getIsArchived()))
                .build();
    }
}
