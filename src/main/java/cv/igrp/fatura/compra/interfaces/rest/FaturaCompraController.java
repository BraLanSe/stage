package cv.igrp.fatura.compra.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.compra.application.commands.AnularFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.ConfirmarFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.CreateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.commands.UpdateFaturaCompraCommand;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
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
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/faturas-compra", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "FaturaCompra", description = "Gestão de faturas de compra")
public class FaturaCompraController {

    private static final Logger LOGGER = LoggerFactory.getLogger(FaturaCompraController.class);

    private final CommandBus commandBus;
    private final FaturaCompraRepository faturaCompraRepo;

    @GetMapping
    @Operation(summary = "Listar faturas de compra")
    public ResponseEntity<Page<FaturaCompraEntity>> list(
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(faturaCompraRepo.findByEstado(estado, pageable));
        }
        return ResponseEntity.ok(faturaCompraRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> create(@RequestBody @Valid FaturaCompraCreateDTO dto) {
        LOGGER.info("[DEBUG] POST /faturas-compra — body recebido: {}", dto);
        try {
            return commandBus.send(new CreateFaturaCompraCommand(dto));
        } catch (Exception e) {
            LOGGER.error("ERROR_DETAIL: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter fatura de compra por ID")
    public ResponseEntity<FaturaCompraEntity> getById(@PathVariable Integer id) {
        return faturaCompraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar fatura de compra (apenas RASCUNHO)")
    public ResponseEntity<FaturaCompraEntity> update(@PathVariable Integer id,
                                                     @RequestBody @Valid FaturaCompraCreateDTO dto) {
        try {
            return commandBus.send(new UpdateFaturaCompraCommand(id, dto));
        } catch (Exception e) {
            LOGGER.error("ERROR_DETAIL: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar fatura de compra")
    public ResponseEntity<FaturaCompraEntity> confirmar(@PathVariable Integer id) {
        return commandBus.send(new ConfirmarFaturaCompraCommand(id));
    }

    @PutMapping("/{id}/anular")
    @Operation(summary = "Anular fatura de compra")
    public ResponseEntity<FaturaCompraEntity> anular(@PathVariable Integer id) {
        return commandBus.send(new AnularFaturaCompraCommand(id));
    }
}
