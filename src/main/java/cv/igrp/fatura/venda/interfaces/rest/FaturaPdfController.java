package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.application.service.FaturaPdfService;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Dedicated PDF export controller.
 * Uses plain @RestController (no @IgrpController) so Spring MVC routes
 * GET /{id}/print directly without IGRP framework interception.
 */
@RestController
@RequestMapping("api/v1/faturas-venda")
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaPdfController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaPdfService faturaPdfService;

    @GetMapping("/{id}/print")
    @Operation(summary = "Gerar PDF fiscal da fatura de venda")
    public ResponseEntity<byte[]> print(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id).map(fatura -> {
            byte[] pdf = faturaPdfService.gerarRecibo(FaturaVendaReadDTO.from(fatura));
            String filename = "fatura-" + (fatura.getCodigo() != null ? fatura.getCodigo() : id) + ".pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }
}
