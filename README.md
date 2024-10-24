# Cloudbox

Esta é uma API de gerenciamento e controle de arquivos construída em [NestJS](https://nestjs.com), que oferece funcionalidades de armazenamento de arquivos, controle de acesso e permissões, e encriptação de dados. O projeto também conta com suporte para deploy via Docker.

## Funcionalidades

- **Armazenamento de Arquivos**: Upload, download e remoção de arquivos.
- **Controle de Acesso**: Definição de permissões para usuários, garantindo segurança no acesso aos arquivos.
- **Encriptação de Dados**: Todos os arquivos são armazenados de forma encriptada.
- **Suporte a Docker**: Imagem Docker pronta para deploy em qualquer ambiente.

## Requisitos

- [Node.js](https://nodejs.org) v14 ou superior
- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- Docker (para deploy com Docker)

## Instalação

### Clonar o Repositório

```bash
git clone https://github.com/DevtApps/cloudbox.git
cd nestjs-file-manager
```
### Instalar as Dependências
```
pnpm install
```

### Configuração

Crie um arquivo .env na raiz do projeto com as seguintes variáveis de ambiente:

```
# Ponto de montagem dos arquivos 
point=cloudbox

# Base de dados
POSTGRES_HOST=localhost
POSTGRES_DATABASE=cloudbox
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=12345678

# Url base para compartilhamento dos arquivos
BASE_URL=http://localhost:3001


# Chaves de encriptação SHA256
IV=
KEY=
```

### Executando o Projeto

#### Desenvolvimento
Para rodar a API em ambiente de desenvolvimento

```
npm run start:dev
```

A API estará disponível em http://localhost:3001.


### Build
Para gerar o build do projeto:
```
pnpm run build
```

### Docker

-  Construa a imagem Docker:

```
docker build -t cloudbox .
```

- Execute o container:

```
docker run -d -p 3000:3001 --name cloudbox-api cloudbox

```


## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou relatar problemas no repositório.


## Licença
Este projeto está licenciado sob a MIT License.