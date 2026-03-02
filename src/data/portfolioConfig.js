// Mapa de slugs para os arquivos de dados de cada portfólio.
// Para adicionar um novo portfólio: crie uma pasta em src/data/<slug>/
// com os arquivos projects.json, conceptual.json, fullstack.json, pricing.json
// e adicione uma entrada aqui.

import defaultProjects from './default/projects.json';
import defaultConceptual from './default/conceptual.json';
import defaultFullstack from './default/fullstack.json';
import defaultPricing from './default/pricing.json';

import p20260302_01_Projects from './20260302_01/projects.json';
import p20260302_01_Conceptual from './20260302_01/conceptual.json';
import p20260302_01_Fullstack from './20260302_01/fullstack.json';
import p20260302_01_Pricing from './20260302_01/pricing.json';

const portfolioConfig = {
    default: {
        projects: defaultProjects,
        conceptual: defaultConceptual,
        fullstack: defaultFullstack,
        pricing: defaultPricing,
        // Data de expiração do countdown (ISO 8601 com fuso horário)
        expiresAt: '2026-03-06T16:00:00-03:00',
        // Contato WhatsApp — mude aqui para atualizar todos os botões do portfólio
        whatsapp: {
            number: '5521989248813',
            message: 'Quero Falar com o Diretor Comercial e Head PR sobre a proposta!',
        },
    },
    '20260302_01': {
        projects: p20260302_01_Projects,
        conceptual: p20260302_01_Conceptual,
        fullstack: p20260302_01_Fullstack,
        pricing: p20260302_01_Pricing,
        // Data de expiração do countdown (ISO 8601 com fuso horário)
        expiresAt: '2026-03-06T16:00:00-03:00',
        // Contato WhatsApp — mude aqui para atualizar todos os botões do portfólio
        whatsapp: {
            number: '5521989248813',
            message: 'Quero Falar com o Diretor Comercial e Head PR sobre a proposta!',
        },
    },
};

export default portfolioConfig;
