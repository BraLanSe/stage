package cv.igrp.fatura.pagamento.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.pagamento.application.commands.CreatePagamentoCommand;
import cv.igrp.fatura.pagamento.application.dto.PagamentoCreateDTO;
import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoDocumentoEntity;
import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoEntity;
import cv.igrp.fatura.pagamento.infrastructure.persistence.repository.PagamentoDocumentoRepository;
import cv.igrp.fatura.pagamento.infrastructure.persistence.repository.PagamentoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/pagamentos", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Pagamentos", description = "Gestão de pagamentos")
public class PagamentoController {

    private final CommandBus commandBus;
    private final PagamentoRepository pagamentoRepo;
    private final PagamentoDocumentoRepository pagamentoDocumentoRepo;

    @GetMapping
    @Operation(summary = "Listar todos os pagamentos")
    public ResponseEntity<Page<PagamentoEntity>> listAll(Pageable pageable) {
        return ResponseEntity.ok(pagamentoRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar pagamento")
    public ResponseEntity<PagamentoEntity> create(@RequestBody @Valid PagamentoCreateDTO dto) {
        return commandBus.send(new CreatePagamentoCommand(dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter pagamento por ID")
    public ResponseEntity<PagamentoEntity> getById(@PathVariable Integer id) {
        return pagamentoRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/documentos")
    @Operation(summary = "Listar documentos associados ao pagamento")
    public ResponseEntity<List<PagamentoDocumentoEntity>> getDocumentos(@PathVariable Integer id) {
        return ResponseEntity.ok(pagamentoDocumentoRepo.findByPagamento_Id(id));
    }
}
