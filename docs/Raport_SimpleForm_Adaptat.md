# RAPORT DE LUCRARI PRACTICE
Disciplina: Administrarea Calculatoarelor
Proiect: SimpleForm (aplicatie web fullstack cu React, ASP.NET Core, MongoDB, Docker, Kubernetes si CI/CD pe Google Kubernetes Engine)
Data: 05.04.2026

## Cuprins
1. Introducere si descrierea proiectului
2. Tehnologii si unelte utilizate
3. Conturi si servicii cloud necesare
4. Lucrarea 1 - Alegerea aplicatiei si implementarea proiectului
5. Lucrarea 2 - Containerizare cu Docker
6. Lucrarea 3 - Orchestrare cu Kubernetes (Rancher Desktop / k3s)
7. Lucrarea 4 - CI/CD cu GitHub Actions si Google Kubernetes Engine
8. Probleme intalnite si solutii aplicate
9. Rezumat final si verificare

## 1. Introducere si descrierea proiectului
SimpleForm este o aplicatie fullstack simpla, construita pentru a demonstra etapele principale din lucrarile practice: dezvoltare, containerizare, orchestrare Kubernetes si automatizare CI/CD.

Aplicatia este compusa din trei componente:
- frontend in React + TypeScript + Vite;
- backend in ASP.NET Core Web API (.NET 8);
- baza de date MongoDB.

Functionalitatea principala este simpla: utilizatorul completeaza un formular cu nume si prenume, frontend-ul trimite datele catre backend, backend-ul le salveaza in MongoDB, iar raspunsul este afisat in interfata printr-un popup.

Arhitectura proiectului este una fullstack simplificata, nu Clean Architecture in sensul raportului-model primit. In proiectul actual, backend-ul este organizat pe controllere, modele si servicii, iar aceasta structura este suficienta pentru cerintele lucrarilor practice.

Structura proiectului este:

```text
AC/
|-- backend/
|   |-- Dockerfile
|   |-- SimpleForm.sln
|   `-- SimpleForm.Api/
|       |-- Controllers/
|       |-- Models/
|       |-- Services/
|       |-- Program.cs
|       `-- appsettings.json
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   `-- src/
|       |-- App.tsx
|       |-- styles.css
|       `-- types.ts
|-- k8s/
|   |-- namespace.yaml
|   |-- mongo.yaml
|   |-- backend.yaml
|   |-- frontend.yaml
|   `-- kustomization.yaml
|-- .github/workflows/
|   `-- gke-deploy.yml
`-- docker-compose.yml
```

## 2. Tehnologii si unelte utilizate
Tehnologiile folosite in proiectul curent sunt:

| Tehnologie | Versiune | Rol |
|---|---:|---|
| .NET / ASP.NET Core | 8.0 | Backend Web API |
| MongoDB.Driver | 2.27.0 | Acces la baza de date MongoDB |
| React | 18.3.1 | Interfata utilizator |
| TypeScript | 5.5.4 | Tipizare frontend |
| Vite | 5.3.4 | Build tool frontend |
| Node.js | 18 Alpine in container | Build frontend |
| nginx | 1.27 Alpine | Servirea frontend-ului in container |
| Docker | engine local | Containerizare |
| Docker Compose | 3.9 | Rulare multi-container locala |
| Kubernetes | k3s / Rancher Desktop | Orchestrare locala |
| GitHub Actions | - | Automatizare CI/CD |
| Google Artifact Registry | - | Stocare imagini in cloud |
| Google Kubernetes Engine | - | Deploy in cloud |

Unelte necesare pentru rulare si dezvoltare:
- Visual Studio Code sau alt IDE;
- Git;
- Rancher Desktop cu Kubernetes activat;
- Docker / engine compatibil disponibil prin Rancher Desktop;
- Node.js si npm pentru frontend local;
- .NET SDK 8 pentru backend local;
- Google Cloud SDK pentru etapa de cloud.

## 3. Conturi si servicii cloud necesare
Pentru etapa locala (laboratoarele 1-3) nu este obligatoriu un cont cloud. Pentru laboratorul 4 sunt necesare:
- cont GitHub pentru repository si GitHub Actions;
- cont Google Cloud Platform;
- proiect GCP activ;
- Artifact Registry pentru stocarea imaginilor Docker;
- cluster GKE pentru deployment;
- service account cu permisiuni necesare pentru workflow.

In implementarea curenta, workflow-ul foloseste urmatoarele secrete GitHub:
- `GCP_PROJECT_ID`
- `GCP_SERVICE_ACCOUNT`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`

Workflow-ul actual este pregatit pentru GKE, nu pentru Cloud Run, deci raportul-model primit a fost adaptat aici la infrastructura reala din proiect.

## 4. Lucrarea 1 - Alegerea aplicatiei si implementarea proiectului
In cadrul primei etape a fost aleasa o aplicatie web simpla, usor de demonstrat si usor de containerizat: un formular web pentru introducerea si salvarea datelor unei persoane.

### 4.1 Backend ASP.NET Core
Backend-ul este implementat in proiectul `backend/SimpleForm.Api` si contine:
- `Program.cs` pentru configurarea aplicatiei;
- `Controllers/SubmissionsController.cs` pentru endpoint-urile HTTP;
- `Services/SubmissionService.cs` pentru accesul la MongoDB;
- `Models/` pentru clasele de date.

Endpoint-urile principale sunt:
- `POST /api/submissions` - salveaza o inregistrare noua;
- `GET /api/submissions` - returneaza cele mai recente inregistrari;
- `GET /health` - endpoint de verificare pentru Kubernetes.

Modelul salvat in MongoDB contine:
- `Id`
- `FirstName`
- `LastName`
- `CreatedAtUtc`

### 4.2 Frontend React
Frontend-ul este implementat in `frontend/src/App.tsx` si afiseaza:
- un formular cu campurile `Nume` si `Prenume`;
- validare simpla in client;
- mesaj de succes intr-un popup dupa salvare;
- mesaje de eroare daca request-ul esueaza.

Frontend-ul foloseste implicit calea relativa `/api`, ceea ce permite:
- dezvoltare locala cu proxy prin Vite;
- rulare in Docker;
- rulare in Kubernetes prin proxy nginx catre backend.

### 4.3 Configurarea aplicatiei
Configurarea backend-ului pentru MongoDB este facuta prin:
- `appsettings.json` pentru rulare locala;
- variabile de mediu pentru Docker si Kubernetes.

Valorile folosite in proiect sunt:
- `MongoDbSettings__ConnectionString`
- `MongoDbSettings__DatabaseName`
- `MongoDbSettings__CollectionName`

Aceasta abordare respecta ideea de externalizare a configuratiei, chiar daca proiectul nu foloseste un fisier `.env` dedicat in forma raportului-model.

## 5. Lucrarea 2 - Containerizare cu Docker
In etapa a doua au fost create containere separate pentru frontend, backend si MongoDB.

### 5.1 Dockerfile pentru backend
Fisierul `backend/Dockerfile` foloseste build multi-stage:
- etapa de build cu `mcr.microsoft.com/dotnet/sdk:8.0`;
- etapa finala cu `mcr.microsoft.com/dotnet/aspnet:8.0`.

Backend-ul expune portul `8080`.

### 5.2 Dockerfile pentru frontend
Fisierul `frontend/Dockerfile` foloseste:
- `node:18-alpine` pentru build-ul aplicatiei React;
- `nginx:1.27-alpine` pentru servirea frontend-ului compilat.

Fisierul `frontend/nginx.conf` a fost configurat astfel incat cererile catre `/api/` sa fie forwardate catre serviciul `backend:8080`.

### 5.3 Docker Compose
Fisierul `docker-compose.yml` defineste urmatoarele servicii:
- `mongo`
- `backend`
- `frontend`

Pornirea locala completa se face cu:

```bash
docker compose up --build
```

Porturile expuse local sunt:
- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- mongo: `mongodb://localhost:27017`

### 5.4 Observatie privind Docker Hub
In proiectul actual, pentru laboratorul 2 nu a fost necesara publicarea imaginilor in Docker Hub. Pentru rularea locala si pentru Kubernetes local cu Rancher Desktop, imaginile pot fi construite direct in runtime-ul local. Publicarea intr-un registry devine necesara in special pentru deploy in cloud.

## 6. Lucrarea 3 - Orchestrare cu Kubernetes (Rancher Desktop / k3s)
Pentru laboratorul 3 a fost folosita distributia k3s inclusa in Rancher Desktop.

### 6.1 Namespace Kubernetes
Aplicatia ruleaza in namespace-ul izolat:
- `simpleform`

Fisierul folosit este `k8s/namespace.yaml`.

### 6.2 MongoDB in Kubernetes
Fisierul `k8s/mongo.yaml` defineste:
- un `PersistentVolumeClaim` numit `mongo-data`;
- un `Deployment` pentru MongoDB;
- un `Service` intern numit `mongo` pe portul `27017`.

Aceasta configuratie asigura persistenta datelor intre reporniri.

### 6.3 Backend in Kubernetes
Fisierul `k8s/backend.yaml` defineste:
- un `Deployment` pentru backend;
- un `Service` intern numit `backend`;
- variabile de mediu pentru conectarea la MongoDB;
- probe de tip readiness si liveness pe endpoint-ul `/health`.

### 6.4 Frontend in Kubernetes
Fisierul `k8s/frontend.yaml` defineste:
- un `Deployment` pentru frontend;
- un `Service` de tip `LoadBalancer` pentru acces extern;
- probe de readiness si liveness pe `/`.

In practica, pe Rancher Desktop in Windows, accesul cel mai sigur este prin:
- `kubectl port-forward svc/frontend 3000:80 -n simpleform`

### 6.5 Kustomize
Fisierul `k8s/kustomization.yaml` permite aplicarea tuturor resurselor printr-o singura comanda:

```bash
kubectl apply -k k8s
```

### 6.6 Verificarea realizata
In timpul implementarii, deploy-ul local a fost verificat practic. Starea finala obtinuta a fost:
- `backend` Running
- `frontend` Running
- `mongo` Running

Verificarile functionale executate au confirmat:
- `GET /health` raspunde cu `{"status":"ok"}`;
- serviciul frontend raspunde cu `HTTP 200 OK`;
- aplicatia este accesibila in clusterul local.

## 7. Lucrarea 4 - CI/CD cu GitHub Actions si Google Kubernetes Engine
Pentru laboratorul 4 a fost pregatit workflow-ul `.github/workflows/gke-deploy.yml`.

### 7.1 Ce face pipeline-ul actual
Pipeline-ul este declansat la:
- push pe branch-ul `main`;
- rulare manuala prin `workflow_dispatch`.

Etapele pipeline-ului sunt:
1. checkout cod din repository;
2. autentificare in Google Cloud prin Workload Identity;
3. configurare `gcloud`;
4. configurare Docker pentru Artifact Registry;
5. obtinere credentials pentru clusterul GKE;
6. build si push pentru imaginea backend;
7. build si push pentru imaginea frontend;
8. aplicare manifeste Kubernetes;
9. actualizare deployment-urilor cu imaginile nou construite;
10. asteptare rollout.

### 7.2 Diferenta fata de raportul-model
Raportul primit initial folosea Google Cloud Run. Proiectul curent foloseste Google Kubernetes Engine, ceea ce este mai apropiat de etapa Kubernetes din laborator si mai consistent cu manifestele existente din directorul `k8s/`.

### 7.3 Ce mai trebuie pentru rulare reala in cloud
Pipeline-ul este pregatit, dar pentru rulare reala mai trebuie:
- configurarea secre­telor GitHub;
- existenta unui proiect GCP valid;
- un cluster GKE activ;
- un repository Artifact Registry creat.

Prin urmare, pentru laboratorul 4 putem spune corect:
- workflow-ul CI/CD este implementat;
- deployment-ul cloud este pregatit tehnic;
- rularea finala depinde de configurarea resurselor GCP.

## 8. Probleme intalnite si solutii aplicate
In procesul de adaptare a proiectului si al rularii in Kubernetes au aparut mai multe probleme reale.

### Problema 1 - Clusterul Rancher Desktop era oprit
Simptom:
- `kubectl get nodes` nu raspundea corect;
- conexiunea catre API server era refuzata.

Solutie:
- a fost pornit Rancher Desktop si s-a verificat contextul `rancher-desktop`.

### Problema 2 - BuildKit / nerdctl nu functiona direct din Windows
Simptom:
- comenzile `nerdctl build` nu reuseau sa construiasca imaginile.

Solutie:
- build-ul a fost facut direct in VM-ul Rancher Desktop, folosind engine-ul Docker disponibil acolo.

### Problema 3 - Kubernetes nu vedea imaginile locale din engine-ul nepotrivit
Simptom:
- podurile backend si frontend intrau in `ErrImagePull` sau `ImagePullBackOff`.

Cauza:
- imaginile fusesera construite initial intr-un runtime diferit fata de cel vazut de cluster.

Solutie:
- imaginile au fost construite direct in Docker-ul din VM-ul Rancher Desktop;
- manifestele au fost ajustate la numele complet `docker.io/library/...`;
- pentru mediul local a fost setat `imagePullPolicy: Never`.

### Problema 4 - Frontend-ul cadea in CrashLoopBackOff
Simptom:
- containerul frontend pornea si se oprea imediat.

Cauza:
- fisierul `frontend/nginx.conf` fusese salvat cu BOM, iar nginx interpreta prima directiva ca `﻿server` in loc de `server`.

Solutie:
- fisierul a fost rescris fara BOM, iar imaginea frontend a fost reconstruita.

### Problema 5 - Diferenta intre raportul-model si proiectul real
Simptom:
- documentul-model descria Cloud Run, Docker Hub si Clean Architecture, dar proiectul real foloseste alt set de decizii tehnice.

Solutie:
- raportul a fost rescris dupa arhitectura reala a proiectului `SimpleForm`.

## 9. Rezumat final si verificare
### Ce a fost realizat
| Lucrare | Cerinta | Status |
|---|---|---|
| Lab 1 | Alegerea si implementarea unei aplicatii web functionale | Realizat |
| Lab 2 | Containerizare cu Docker pentru frontend, backend si MongoDB | Realizat |
| Lab 2 | Rulare locala cu Docker Compose | Realizat |
| Lab 3 | Namespace Kubernetes | Realizat |
| Lab 3 | Deployment + Service pentru MongoDB | Realizat |
| Lab 3 | Deployment + Service pentru backend | Realizat |
| Lab 3 | Deployment + Service pentru frontend | Realizat |
| Lab 3 | Verificare functionala in Rancher Desktop | Realizat |
| Lab 4 | Workflow GitHub Actions pentru GKE | Realizat |
| Lab 4 | Build si push imagini in Artifact Registry | Pregatit |
| Lab 4 | Deploy automat in cluster GKE | Pregatit |

### Checklist final
- [x] Aplicatia ruleaza local cu Docker Compose
- [x] Aplicatia ruleaza in Kubernetes local
- [x] Podurile backend, frontend si mongo sunt functionale in namespace-ul `simpleform`
- [x] Backend-ul raspunde la `/health`
- [x] Frontend-ul raspunde cu HTTP 200 in cluster
- [x] Manifestele Kubernetes sunt create si aplicabile prin `kubectl apply -k k8s`
- [x] Workflow GitHub Actions pentru GKE este creat
- [ ] Secretele GCP sunt configurate in GitHub
- [ ] Deployment-ul final in GKE este executat efectiv

## Concluzie
Proiectul `SimpleForm` acopera complet laboratorul 2 si laboratorul 3 la nivel practic si functional. Pentru laboratorul 4 exista deja infrastructura de automatizare CI/CD, iar pasul ramas este configurarea efectiva a resurselor Google Cloud pentru deployment-ul final in GKE.

Prin aceasta adaptare, raportul este acum aliniat cu arhitectura, fisierele, tehnologiile si starea reala a proiectului din repository.
