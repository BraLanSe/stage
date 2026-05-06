package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.application.service.FaturaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/print-service")
public class FaturaPdfExportController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaPdfService faturaPdfService;

    public FaturaPdfExportController(FaturaVendaRepository faturaVendaRepo, FaturaPdfService faturaPdfService) {
        this.faturaVendaRepo = faturaVendaRepo;
        this.faturaPdfService = faturaPdfService;
        log.info(">>> FaturaPdfExportController INSTANTIATED — route: GET /print-service/fatura/{{id}}");
    }

    @PostConstruct
    void init() {
        log.info(">>> FaturaPdfExportController READY — GET /print-service/fatura/{{id}}");
    }

    @GetMapping("/fatura/{id}")
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
