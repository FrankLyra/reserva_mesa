package br.com.reservamesa;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ReservaMesaApplication {

    public static void main(String[] args) {
        configureRenderDatabaseUrl();
        SpringApplication.run(ReservaMesaApplication.class, args);
    }

    private static void configureRenderDatabaseUrl() {
        if (System.getenv("DB_URL") != null || System.getProperty("DB_URL") != null) {
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        URI uri = URI.create(databaseUrl);
        String[] credentials = uri.getUserInfo().split(":", 2);
        String username = URLDecoder.decode(credentials[0], StandardCharsets.UTF_8);
        String password = credentials.length > 1
            ? URLDecoder.decode(credentials[1], StandardCharsets.UTF_8)
            : "";
        String database = uri.getPath().replaceFirst("^/", "");
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();

        System.setProperty("DB_URL", "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database);
        System.setProperty("DB_USERNAME", username);
        System.setProperty("DB_PASSWORD", password);
    }
}
