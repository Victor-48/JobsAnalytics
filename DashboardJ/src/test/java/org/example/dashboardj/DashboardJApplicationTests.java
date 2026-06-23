package org.example.dashboardj;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "GRAPH_URI=bolt://localhost:7687",
        "GRAPH_USERNAME=testuser",
        "GRAPH_PASSWORD=testpass",
        "JWT_SECRET=",
        "llm.provider=ollama"
})
class DashboardJApplicationTests {

    @Test
    void contextLoads() {
    }
}