package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.application.service.FaturaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/pdf/faturas-venda")
@RequiredArgsConstructor
public class FaturaPdfExportController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaPdfService faturaPdfService;

    @PostConstruct
    void init() {
        log.info(">>> FaturaPdfExportController registered — GET /api/v1/pdf/faturas-venda/{id}");
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportPdf(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(fatura -> {
                    byte[] pdf = faturaPdfService.gerarRecibo(FaturaVendaReadDTO.from(fatura));
                    String filename = "fatura-" + (fatura.getCodigo() != null ? fatura.getCodigo() : id) + ".pdf";
                    return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_PDF)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                            .body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
