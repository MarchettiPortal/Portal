export type Node = {
    id: string
    label: string
    icon?: string
    to?: string
    groups?: string[]
    children?: Node[]
}

export const sidebarTree: Node[] = [

    { id: 'home', label: 'Home', icon: '', to: '/home'},

    {
        id: 'tiinfra', label: 'TI-Infraestrutura', icon: '', groups: ['TI - Infraestrutura'],
        children: [
            { id: 'procedimentos', label: 'Procedimentos', to: '/tiinfraestrutura/procedimentos', },
            { id: 'servicos', label: 'Serviços', to: '/tiinfraestrutura/servicos',  },
            { id: 'usuariosedit', label: 'Usuários', to: '/tiinfraestrutura/usuarios',  },
            { id: 'apis', label: 'APIs', to: '/tiinfraestrutura/apis',  },
            { id: 'chamadosinfra', label: 'Chamados TI-Infra',  }
        ]
    },

    {
        id: 'engenhariap', label: 'Engenharia de Produto', icon: '', groups: ['Engenharia de Produtos'],
        children: [
            { id: 'clp', label: 'CLP', to: '/engenhariadeproduto/clp', },
            { id: 'clplog', label: 'CLP Log', to: '/engenhariadeproduto/clp',  }
        ]
    },


]