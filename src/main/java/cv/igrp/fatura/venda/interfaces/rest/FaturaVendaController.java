package cv.igrp.fatura.venda.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.venda.application.commands.ConfirmarFaturaVendaCommand;
import cv.igrp.fatura.venda.application.commands.CreateFaturaVendaCommand;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-venda", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaVenda", description = "Gestão de faturas de venda")
public class FaturaVendaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaVendaController.class);

    private final CommandBus commandBus;
    private final FaturaVendaRepository faturaVendaRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de venda")
    public ResponseEntity<Page<FaturaVendaEntity>> list(Pageable pageable) {
        return ResponseEntity.ok(faturaVendaRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> create(@RequestBody @Valid FaturaVendaCreateDTO dto, BindingResult result) {
        LOGGER.info("[DEBUG] POST /faturas-venda — body recebido: {}", dto);
        if (result.hasErrors()) {
            result.getFieldErrors().forEach(e ->
                LOGGER.error("[VALIDATION] campo='{}' valor='{}' erro='{}'",
                        e.getField(), e.getRejectedValue(), e.getDefaultMessage())
            );
            return ResponseEntity.badRequest().build();
        }
        try {
            return commandBus.send(new CreateFaturaVendaCommand(dto));
        } catch (Exception e) {
            LOGGER.error("ERROR_DETAIL: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de venda por ID")
    public ResponseEntity<FaturaVendaEntity> getById(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de venda")
    public ResponseEntity<FaturaVendaEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaVendaCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de venda")
    public ResponseEntity<FaturaVendaEntity> anular(@PathVariable Integer id) {
        return faturaVendaRepo.findById(id).map(f -> {
            f.setEstado("ANULADO");
            return ResponseEntity.ok(faturaVendaRepo.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }
}
