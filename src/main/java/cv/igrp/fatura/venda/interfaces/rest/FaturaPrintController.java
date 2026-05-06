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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/pdf/faturas-venda")
@RequiredArgsConstructor
@Tag(name = "FaturaPrint", description = "Exportação PDF de faturas")
public class FaturaPrintController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaPdfService faturaPdfService;

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "Exportar PDF fiscal da fatura de venda")
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
