package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.fatura.venda.application.service.FaturaVendaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
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
    private final FaturaVendaPdfService faturaPdfService;

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> exportPdf(@PathVariable Integer id) {
        log.info(">>> Generating PDF for Fatura ID: {}", id);
        return faturaVendaRepo.findById(id)
                .map(fatura -> {
                    try {
                        byte[] pdf = faturaPdfService.generate(fatura);
                        return ResponseEntity.ok()
                                .contentType(MediaType.APPLICATION_PDF)
                                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"fatura-" + id + ".pdf\"")
                                .body(pdf);
                    } catch (Exception e) {
                        log.error("Error generating PDF for fatura {}", id, e);
                        return ResponseEntity.internalServerError().<byte[]>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
