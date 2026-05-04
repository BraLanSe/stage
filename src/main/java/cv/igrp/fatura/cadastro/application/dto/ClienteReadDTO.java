package cv.igrp.fatura.cadastro.application.dto;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import lombok.Data;

@Data
public class ClienteReadDTO {

    private Integer id;
    private String codigo;
    private Boolean indColetivo;
    private String desig;
    private String descr;
    private String nif;
    private String numCliente;
    private String email;
    private String telefone;
    private Integer geografiaId;
    private String pais;
    private String endereco;
    private String pessoaContacto;
    private Boolean aplicarImpostos;
    private String motivoNaoAplicarImposto;
    private Integer contaGlId;
    private String estado;
    private Integer prEnquadramentoId;

    public static ClienteReadDTO from(ClienteEntity e) {
        ClienteReadDTO dto = new ClienteReadDTO();
        dto.setId(e.getId());
        dto.setCodigo(e.getCodigo());
        dto.setIndColetivo(e.getIndColetivo());
        dto.setDesig(e.getDesig());
        dto.setDescr(e.getDescr());
        dto.setNif(e.getNif());
        dto.setNumCliente(e.getNumCliente());
        dto.setEmail(e.getEmail());
        dto.setTelefone(e.getTelefone());
        dto.setGeografiaId(e.getGeografiaId());
        dto.setPais(e.getPais());
        dto.setEndereco(e.getEndereco());
        dto.setPessoaContacto(e.getPessoaContacto());
        dto.setAplicarImpostos(e.getAplicarImpostos());
        dto.setMotivoNaoAplicarImposto(e.getMotivoNaoAplicarImposto());
        dto.setContaGlId(e.getContaGlId());
        dto.setEstado(e.getEstado());
        dto.setPrEnquadramentoId(e.getPrEnquadramento() != null ? e.getPrEnquadramento().getId() : null);
        return dto;
    }
}
