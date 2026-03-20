package org.example.dashboardj.service;

import org.example.dashboardj.dto.ProgrammingLanguageDTO;

import java.util.List;

public interface ProgrammingLanguageService {

    List<ProgrammingLanguageDTO> getAllLanguages();

    ProgrammingLanguageDTO getLanguageById(Long id);

    ProgrammingLanguageDTO createLanguage(ProgrammingLanguageDTO dto);

    ProgrammingLanguageDTO updateLanguage(Long id, ProgrammingLanguageDTO dto);

    void deleteLanguage(Long id);

    List<ProgrammingLanguageDTO> getTopLanguages();

    List<ProgrammingLanguageDTO> searchLanguages(String name);
}
