package org.example.dashboardj.converter.reading;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@ReadingConverter
public class StringToLocalDateConverter implements Converter<String, LocalDate> {

    @Override
    public LocalDate convert(String source) {
        if (source == null || source.isEmpty()) {
            return null;
        }
        try {
            // Handle cases where the date might have a time part (e.g., "2023-10-26T10:00:00")
            String datePart = source.split("T")[0];
            return LocalDate.parse(datePart, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            System.err.println("Could not parse date string from database: " + source);
            return null;
        }
    }
}