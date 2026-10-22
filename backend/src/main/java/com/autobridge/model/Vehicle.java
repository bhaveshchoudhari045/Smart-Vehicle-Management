package com.autobridge.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Brand is required")
    @Size(max = 60)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 80)
    private String model;

    @Min(value = 1990, message = "Year must be 1990 or later")
    @Max(value = 2100, message = "Year must be 2100 or earlier")
    private int modelYear;

    @NotBlank(message = "Category is required")
    @Size(max = 40)
    private String category;

    @NotBlank(message = "Fuel type is required")
    @Size(max = 30)
    private String fuelType;

    @NotBlank(message = "Transmission is required")
    @Size(max = 30)
    private String transmission;

    @Positive(message = "Price must be greater than zero")
    private long price;

    @Size(max = 120)
    private String engine;

    @Size(max = 1000, message = "Description can be at most 1000 characters")
    @Column(length = 1000)
    private String description;

    @Size(max = 1000, message = "Image URL is too long")
    @Column(length = 1000)
    private String imageUrl;

    private boolean available = true;

    public Vehicle() {
    }

    public Vehicle(String brand, String model, int modelYear, String category, String fuelType,
                   String transmission, long price, String engine, String description,
                   String imageUrl, boolean available) {
        this.brand = brand;
        this.model = model;
        this.modelYear = modelYear;
        this.category = category;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.price = price;
        this.engine = engine;
        this.description = description;
        this.imageUrl = imageUrl;
        this.available = available;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public int getModelYear() { return modelYear; }
    public void setModelYear(int modelYear) { this.modelYear = modelYear; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public String getEngine() { return engine; }
    public void setEngine(String engine) { this.engine = engine; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
