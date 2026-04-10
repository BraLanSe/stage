package cv.igrp.fatura.cadastro.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import cv.igrp.fatura.cadastro.application.dto.ClienteCreateDTO;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrEnquadramentoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@IgrpController
@RestController
@RequestMapping("api/v1/clientes")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Gestão de clientes")
public class ClienteController {

    private final ClienteRepository clienteRepo;
    private final PrEnquadramentoRepository prEnquadramentoRepo;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Listar todos os clientes")
    public ResponseEntity<Page<ClienteEntity>> listAll(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(clienteRepo.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Criar cliente")
    public ResponseEntity<ClienteEntity> create(@RequestBody @Valid ClienteCreateDTO dto) {
        ClienteEntity entity = new ClienteEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setDesig(dto.getDesig());
        entity.setDescr(dto.getDescr());
        entity.setIndColetivo(dto.getIndColetivo() != null ? dto.getIndColetivo() : false);
        entity.setNif(dto.getNif());
        entity.setNumCliente(dto.getNumCliente());
        entity.setEmail(dto.getEmail());
        entity.setTelefone(dto.getTelefone());
        entity.setGeografiaId(dto.getGeografiaId());
        entity.setPais(dto.getPais());
        entity.setEndereco(dto.getEndereco());
        entity.setPessoaContacto(dto.getPessoaContacto());
        entity.setAplicarImpostos(dto.getAplicarImpostos() != null ? dto.getAplicarImpostos() : true);
        entity.setMotivoNaoAplicarImposto(dto.getMotivoNaoAplicarImposto());
        entity.setContaGlId(dto.getContaGlId());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
        if (dto.getPrEnquadramentoId() != null) {
            prEnquadramentoRepo.findById(dto.getPrEnquadramentoId()).ifPresent(entity::setPrEnquadramento);
        }
        return ResponseEntity.ok(clienteRepo.save(entity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter cliente por ID")
    public ResponseEntity<ClienteEntity> getById(@PathVariable Integer id) {
        return clienteRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cliente")
    public ResponseEntity<ClienteEntity> update(@PathVariable Integer id, @RequestBody @Valid ClienteCreateDTO dto) {
        return clienteRepo.findById(id).map(entity -> {
            entity.setCodigo(dto.getCodigo());
            entity.setDesig(dto.getDesig());
            entity.setDescr(dto.getDescr());
            entity.setIndColetivo(dto.getIndColetivo() != null ? dto.getIndColetivo() : entity.getIndColetivo());
            entity.setNif(dto.getNif());
            entity.setNumCliente(dto.getNumCliente());
            entity.setEmail(dto.getEmail());
            entity.setTelefone(dto.getTelefone());
            entity.setGeografiaId(dto.getGeografiaId());
            entity.setPais(dto.getPais());
            entity.setEndereco(dto.getEndereco());
            entity.setPessoaContacto(dto.getPessoaContacto());
            entity.setAplicarImpostos(dto.getAplicarImpostos() != null ? dto.getAplicarImpostos() : entity.getAplicarImpostos());
            entity.setMotivoNaoAplicarImposto(dto.getMotivoNaoAplicarImposto());
            entity.setContaGlId(dto.getContaGlId());
            if (dto.getEstado() != null) entity.setEstado(dto.getEstado());
            if (dto.getPrEnquadramentoId() != null) {
                prEnquadramentoRepo.findById(dto.getPrEnquadramentoId()).ifPresent(entity::setPrEnquadramento);
            }
            return ResponseEntity.ok(clienteRepo.save(entity));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cliente")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!clienteRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
