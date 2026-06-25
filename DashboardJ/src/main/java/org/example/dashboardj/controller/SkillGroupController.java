package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.SkillGroupDTO;
import org.example.dashboardj.service.SkillGroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esco/skill-groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillGroupController {

    private final SkillGroupService service;

    @GetMapping
    public ResponseEntity<Page<SkillGroupDTO>> getAllSkillGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllSkillGroups(PageRequest.of(page, size)));
    }

    @GetMapping("/{uri}")
    public ResponseEntity<SkillGroupDTO> getSkillGroupByUri(@PathVariable String uri) {
        SkillGroupDTO skillGroup = service.getSkillGroupByUri(uri);
        return skillGroup != null ? ResponseEntity.ok(skillGroup) : ResponseEntity.notFound().build();
    }
}
