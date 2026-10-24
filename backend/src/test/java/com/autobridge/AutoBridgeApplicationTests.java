package com.autobridge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:autobridge-test;DB_CLOSE_DELAY=-1")
class AutoBridgeApplicationTests {

    private static final String VEHICLE_JSON = "{\"brand\":\"Test\",\"model\":\"Runner\",\"modelYear\":2025,"
            + "\"category\":\"SUV\",\"fuelType\":\"Petrol\",\"transmission\":\"Manual\",\"price\":1000000,"
            + "\"available\":true}";

    @Autowired
    MockMvc mvc;

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return new ObjectMapper().readTree(body).get("token").asText();
    }

    @Test
    void healthEndpointIsPublic() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void protectedEndpointsNeedLogin() throws Exception {
        mvc.perform(get("/api/vehicles")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"customer@autobridge.com\",\"password\":\"nope-nope\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customerCannotManageVehiclesButManufacturerCan() throws Exception {
        String customerToken = login("customer@autobridge.com", "Buyer@123");
        mvc.perform(post("/api/vehicles").header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(VEHICLE_JSON))
                .andExpect(status().isForbidden());

        String makerToken = login("manufacturer@autobridge.com", "Maker@123");
        mvc.perform(post("/api/vehicles").header("Authorization", "Bearer " + makerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(VEHICLE_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.model").value("Runner"));
    }

    @Test
    void registrationAlwaysCreatesACustomer() throws Exception {
        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Test User\",\"email\":\"test.user@example.com\","
                                + "\"password\":\"Passw0rd!\",\"role\":\"MANUFACTURER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void customerCanCreateAnEnquiry() throws Exception {
        String token = login("customer@autobridge.com", "Buyer@123");
        mvc.perform(post("/api/enquiries").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vehicleId\":1,\"type\":\"TEST_DRIVE\",\"message\":\"Hello\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    void showroomCanReceiveDelivery() throws Exception {
        String token = login("showroom@autobridge.com", "Show@123");
        mvc.perform(post("/api/inventory/1/delivery").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"quantity\":2}"))
                .andExpect(status().isOk());
    }
}
