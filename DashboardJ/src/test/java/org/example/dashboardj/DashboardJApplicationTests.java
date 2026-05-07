package org.example.dashboardj;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "JWT_SECRET="
})
class DashboardJApplicationTests {

    @Test
    void contextLoads() {
    }

}