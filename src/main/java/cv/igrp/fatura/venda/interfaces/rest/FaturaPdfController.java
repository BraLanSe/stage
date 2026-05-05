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
 * PDF export controller mapped to /api/v1/pdf/** — a path that no
 * @IgrpController owns, so IGRP's high-priority HandlerMapping never
 * intercepts GET requests here and Spring MVC routes them normally.
 */
@RestController
@RequestMapping("api/v1/pdf")
@RequiredArgsConstructor
@Tag(name = "PDF Export", description = "Exportação de documentos em PDF")
public class FaturaPdfController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaPdfService faturaPdfService;

    @GetMapping("/faturas-venda/{id}")
    @Operation(summary = "Gerar PDF fiscal da fatura de venda")
    public ResponseEntity<byte[]> printFaturaVenda(@PathVariable Integer id) {
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
