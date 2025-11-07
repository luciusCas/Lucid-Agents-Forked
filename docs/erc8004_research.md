# ERC-8004: Standar Identitas, Reputasi, dan Validasi untuk Agen Tanpa Kepercayaan

## Ringkasan Eksekutif

ERC‑8004 memperkenalkan lapisan kepercayaan minimal yang memungkinkan penemuan, penilaian, dan interaksi agen otonom di berbagai organisasi tanpa memerlukan kepercayaan awal. Intinya, ERC‑8004 menetapkan tiga registri ringan yang beroperasi on‑chain: Identity Registry berbasis ERC‑721 untuk identitas agen yang portabel, Reputation Registry untuk sinyal umpan balik yang dapat dikomposisi, dan Validation Registry untuk meminta dan mencatat hasil verifikasi dari validator independen. Pendekatan ini secara eksplisit memisahkan discovery dari trust: discovery dicapai melalui tautan on‑chain ke deskripsi dan endpoint agen; trust dicapai melalui model kepercayaan pluggable—reputasi, kripto‑ekonomi (stake), bukti kriptografis seperti Trusted Execution Environment (TEE) dan zero‑knowledge machine learning (zkML).[^1]

Kontribusi utama standar meliputi: (1) identitas agen yang tahan sensor dan portabel di seluruh jaringan EVM, (2) sistem umpan balik yang sah secara kriptografis namun efisien, dan (3) antarmuka generik untuk verifikasi pekerjaan agen yang mampu mengakomodasi beragam validator (stake‑secured re‑execution, TEE, zkML). Hasil yang diharapkan adalah interoperabilitas lintas toolchain agen, pengurangan risiko fraud melalui sinyal publik, dan komposabilitas on‑chain yang memungkinkan smart contract dan indekser membangun pengalaman pengguna (UX) dan keputusan yang lebih baik.[^1][^2]

Laporan ini menyajikan analisis teknis komprehensif, pattern implementasi, desain identitas, sistem reputasi, mekanisme validasi, integrasi EVM, best practices operasional, roadmap implementasi, dan studi kasus. Di bagian akhir, kami merangkum risiko dan mitigasi, serta rekomendasi praktis untuk tim yang ingin mengadopsi ERC‑8004 di produksi. Keterbatasan dan gaps informasi—termasuk ketiadaan data gas benchmark lintas L2, status stabilitas antarmuka lintas versi, dan konfigurasi keamanan TEE vendor‑spesifik—diringkas di bagian Information Gaps untuk transparansi rencana adopsi.[^1][^2][^19]

## Latar Belakang dan Motivasi

Komunikasi antar agen telah difasilitasi oleh protokol seperti Agent‑to‑Agent (A2A) dan Model Context Protocol (MCP), yang masing‑masing mendefinisikan cara agen bertukar konteks, kemampuan, dan hasil. Namun, kedua protokol tersebut tidak secara inheren memecahkan dua persyaratan fondamentale untuk ekonomi agen yang terbuka: discovery (bagaimana menemukan agen dan kapabilitasnya) dan trust (bagaimana mempercayai hasil dan perilaku agen di luar batas organisasi). ERC‑8004 hadir untuk mengisi celah ini dengan menambahkan trust layer ringan yang berdiri di atas registri on‑chain yang kompatibel dengan standar yang ada, sehingga keputusan tentang agen—memilih, membayar, atau mengeksekusi tugas—dapat didasarkan pada sinyal yang dapat diverifikasi.[^3][^1]

Desain ERC‑8004 mengadopsi prinsip minimalisme: data penting disimpan on‑chain dalam bentuk ringkas, sementara konten kaya disimpan off‑chain (misalnya IPFS) dan hanya direferensikan melalui URI dan hash integritas. Model kepercayaan dirancang pluggable: organisasi dapat memilih kombinasi reputasi, validasi kripto‑ekonomi, atestasi TEE, atau bukti zkML sesuai nilai yang berisiko dan requisito compliance. Dengan demikian, ERC‑8004 tidak menggantikan protokol A2A/MCP, melainkan melengkapi keduanya dengan fondasi trust yang jelas, sehingga pengalaman discovery dan trust dapat berkembang secara independen namun tetap interoperable.[^2][^6][^1]

## Gambaran Arsitektur ERC‑8004

Arsitektur ERC‑8004 terdiri dari tiga registri on‑chain yang saling terkait namun dapat deployed secara modular:

- Identity Registry: ERC‑721 + URIStorage yang menunjuk ke file registrasi agen. Setiap tokenId berperan sebagai agentId, dengan tokenURI mengarah ke deskripsi dan endpoint agen. Ekstensi metadata on‑chain menyediakan cara untuk menyimpan key/value kecil yang berguna untuk filter cepat, seperti agentWallet. Keuntungan: kompatibel dengan ekosistem ERC‑721, serta ringan secara gas karena payload besar ada off‑chain.[^1]
- Reputation Registry: Antarmuka untuk umpan balik terotorisasi yang memancarkan sinyal publik. Skor 0–100, tag opsional, dan hash file off‑chain dicatat on‑chain; isi detail off‑chain (JSON) dapat memuat proof_of_payment atau atribut lain yang relevan. Analisis agregasi dapat dilakukan off‑chain untuk efisiensi, dengan ringkasan yang dapat dibaca on‑chain untuk komposabilitas.[^1][^2]
- Validation Registry: Antarmuka generik untuk meminta validasi dan memposting respons validator. validatorAddress menentukan siapa yang boleh merespons, response berada pada skala 0–100, dan requestHash/commitment mengikat pekerjaan yang divalidasi. Registri ini tidak mengatur insentif/slashing—ini左ху implementasi validator di luar scope ERC‑8004.[^1]

Alur end‑to‑end: discovery → otorisasi umpan balik → validasi → penyimpanan sinyal on‑chain → agregasi/rekonstruksi untuk UX. Peran события/indekser sangat sentral karena event‑event seperti Registered, NewFeedback, ValidationRequest, dan ValidationResponse menjadi sumber kebenaran untuk subgraph dan UI. ERC‑8004 merekomendasikan single registry per chain untuk mengurangi fragmentation dan meningkatkan konsistensi data, dengan opsi pencatatan multi‑chain jika kebutuhan operasional mengharuskan.[^1][^2]

Untuk memperlihatkan relasi antar komponen dan sumber data, Tabel 1 merangkum peta arsitektur ERC‑8004.

Tabel 1 — Peta Komponen Arsitektur ERC‑8004
| Komponen | Basis Standard | Storage Pattern | Event Kunci | Fungsi Utama |
|---|---|---|---|---|
| Identity Registry | ERC‑721 + URIStorage | tokenURI off‑chain; metadata key/value on‑chain kecil | Registered, MetadataSet | register, setMetadata/getMetadata |
| Reputation Registry | Antarmuka umpan balik (EIP‑191/ERC‑1271 feedbackAuth) | Skor/tag on‑chain; payload detail off‑chain | NewFeedback, FeedbackRevoked, ResponseAppended | giveFeedback, revokeFeedback, appendResponse, getSummary |
| Validation Registry | Antarmuka request/response | request/validator/response/tag on‑chain; bukti off‑chain | ValidationRequest, ValidationResponse | validationRequest, validationResponse, getValidationStatus |

Tabel 1 menegaskan bahwa ERC‑8004 menyimpan only what's necessary on‑chain untuk mencapai verifikasi dan komposabilitas, sambil membiarkan payload kaya off‑chain agar skema tetap hemat gas dan fleksibel.[^1][^2]

## Spesifikasi Teknis dan Pola Implementasi

Spesifikasi ERC‑8004 mengikuti kata kunci requirement level menurut RFC 2119 dan RFC 8174, sehingga “MUST”, “SHOULD”, dan “MAY” memiliki makna normatif yang jelas. Di层面 implementasi, terdapat tiga kontrak: IdentityRegistry, ReputationRegistry, dan ValidationRegistry. Empat pola implementasi yang lazim muncul:

1) Kontrak registroire singleton per chain: memastikan discovery/UX konsisten dan menurunkan fragmentasi indeks.[^1]  
2) Data off‑chain di IPFS/HTTPS dengan hash integritas: mengurangi biaya gas, memungkinkan pembaruan deskripsi tanpa memodifikasi on‑chain state secara berat.[^1][^2]  
3) Operator/delegasikan управление: owner agen dapat mendelegasikan update tokenURI dan metadata tertentu kepada operator yang tepercaya.[^1]  
4) Integrasi event‑driven dengan subgraph: indekser memproses event sebagai sumber kebenaran untuk agregasi, filter, dan UI.[^2][^12]

ABI/function signature inti dapat diringkas seperti pada Tabel 2.

Tabel 2 — Ringkasan Fungsi dan Event Kunci
| Registri | Fungsi/Event | Ringkasan Parameter/Aturan |
|---|---|---|
| Identity | register(tokenURI, Metadata[]), register(tokenURI), register() | Menghasilkan agentId (tokenId). Set tokenURI sesuai ERC721URIStorage. |
| Identity | setMetadata(agentId, key, value), getMetadata(agentId, key) | Metadata on‑chain kecil. Emits MetadataSet. |
| Identity | event Registered(agentId, tokenURI, owner), MetadataSet | Jejak on‑chain registrasi dan update metadata. |
| Reputation | giveFeedback(agentId, score, tag1, tag2, fileuri, filehash, feedbackAuth) | score ∈ [0,100]; feedbackAuth ditandatangani (EIP‑191/ERC‑1271). |
| Reputation | revokeFeedback(agentId, index), appendResponse(agentId, client, index, responseUri, responseHash) | Mengizinkan pencabutan/append respons. |
| Reputation | getSummary(agentId, clients[], tag1, tag2) → (count, avgScore) | Aggregat on‑chain untuk komposabilitas. |
| Reputation | event NewFeedback, FeedbackRevoked, ResponseAppended | Sinyal publik. |
| Validation | validationRequest(validatorAddress, agentId, requestUri, requestHash) | Hanya owner/operator agentId. |
| Validation | validationResponse(requestHash, response, responseUri, responseHash, tag) | Hanya validatorAddress pada request terkait. response ∈ [0,100]. |
| Validation | getValidationStatus(requestHash) → (validator, agentId, response, tag, lastUpdate) | Status dapat dibaca on‑chain. |
| Validation | event ValidationRequest, ValidationResponse | Sinyal publik status dan hasil. |

Aspek ortogonal: pembayaran bukan bagian inti ERC‑8004, namun dapat diintegrasi dengan sinyal pembayaran seperti x402 untuk proof_of_payment di file umpan balik off‑chain atau alur settlement lainnya.[^1][^2][^22][^9]

### Identity Registry (ERC‑721 + URIStorage)

Setiap agen dinyatakan sebagai NFT, dengan tokenURI menunjuk ke file registrasi off‑chain (JSON) yang menjelaskan name, description, image, endpoints, registrations, dan supportedTrust. Ekstensi metadata on‑chain memungkinkan penyimpanan key/value yang ringan seperti agentWallet. Field name, description, image mengikuti konvensi ERC‑721 untuk kompatibilitas UI. Pendaftaran multiple registration entries memungkinkan agen mengiklankan beberapa endpoint (A2A, MCP, ENS, DID, dompet) dan/atau beberapa chain, selama setiap entitas valid (contoh: CAIP‑10 untuk identifikasi akun lintas chain).[^1][^2][^4][^5]

Tabel 3 memetakan schema JSON yang direkomendasikan.

Tabel 3 — Peta Field File Registrasi Agen
| Field | Wajib | Deskripsi Singkat |
|---|---|---|
| type | Ya | Link ke tipe registrasi ERC‑8004 (v1). |
| name | Ya | Nama agen. |
| description | Ya | Deskripsi dalam bahasa natural (kapabilitas, harga, interaksi). |
| image | Ya | Ikon/头像 untuk kompatibilitas ERC‑721. |
| endpoints[] | Tidak | Daftar endpoint; tiap entri: name, endpoint, version/capabilities. |
| registrations[] | Ya | agentId dan agentRegistry (eip155:chain:address). |
| supportedTrust[] | Tidak | Daftar model kepercayaan yang didukung: reputation, crypto-economic, tee-attestation, zkml. |
| agentWallet (via metadata) | Tidak | Alamat dompet agen (disimpan on‑chain via setMetadata). |

Pembaruan tokenURI mengikuti pola ERC721URIStorage; yang penting, pointer dan hash on‑chain tidak dapat dihapus, sehingga integritas jejak audit terjaga meskipun isi file registrasi diperbarui.[^1][^2][^5]

### Reputation Registry

Registri Reputasi mengharuskan presence feedbackAuth yang sah, ditandatangani menggunakan EIP‑191 atau ERC‑1271 oleh pemilik/operator agen. Tuple feedbackAuth mengecek agentId, clientAddress, chainId, identityRegistry, indexLimit, expiry, dan signerAddress. Hanya klien yang diotorisasi dapat memposting umpan balik, namun mekanisme ini tidak cukup untuk mencegah serangan Sybil secara menyeluruh; karena itu, sistem produksi sebaiknya menambahkan lapisan mitigasi seperti pembobotan reviewer tepercaya, stake, atau penalti.[^1][^2][^6]

Event NewFeedback menandai penambahan sinyal publik, sementara revokeFeedback dan appendResponse menyediakan koreksi dan dialog. Fungsi getSummary membaca agregasi on‑chain untuk komposabilitas; agregasi lanjutan (misalnya, weighted scoring,filtering tag‑spesifik) dilakukan off‑chain oleh indekser/aggregator.

Tabel 4 menyorot parameter utama giveFeedback.

Tabel 4 — Parameter giveFeedback
| Field | Opsional | Validasi/Aturan |
|---|---|---|
| agentId | Tidak | Harus agen tervalidasi. |
| score | Tidak | 0–100. |
| tag1, tag2 | Ya | Opsional; bebas untuk filter/alur bisnis. |
| fileuri, filehash | Ya | URI off‑chain dan hash integritas. |
| feedbackAuth | Tidak | Ditandatangani (EIP‑191/ERC‑1271); verifikasi masa berlaku, chainId, registry, indexLimit. |

Off‑chain feedback file dapat memuat informasi kaya, termasuk proof_of_payment (misalnya, txHash, from/to, chainId) yang berasal dari standar pembayaran seperti x402, serta capability dan task metadata yang konsisten dengan kosakata A2A/MCP. Skema media типа для pertukaran reputasi (reputon) dapat dirujuk pada RFC 7071 untuk interoperabilitas lintas sistem.[^1][^2][^22][^9][^10][^3]

### Validation Registry

Registri Validasi memfasilitasi dua panggilan utama: validationRequest (pemilik/operator agen) dan validationResponse (validatorAddress terkait). Respons Validator berupa skala 0–100, dengan responseUri/off‑chain evidence yang dimuat sesuai kebutuhan validator. Implementasi validator berada di luar cakupan ERC‑8004, tetapi registri menyediakan status dan ringkasan yang dapat diminta on‑chain kapan saja.[^1][^2]

Tabel 5 merangkum parameter utama.

Tabel 5 — Parameter ValidationRegistry
| Fungsi | Parameter Kunci | Aturan |
|---|---|---|
| validationRequest | validatorAddress, agentId, requestUri, requestHash | Hanya owner/operator agentId; requestHash opsional jika URI adalah content‑addressable. |
| validationResponse | requestHash, response, responseUri, responseHash, tag | Hanya validatorAddress terkait; dapat dipanggil berkali‑untuk progres; response ∈ [0,100]. |

Insentif, slashing, dan protokol ekonomi validator (mis. restaking, Actively Validated Services) bersifat di luar scope registri—fokus ERC‑8004 adalah antarmuka dan jejak audit minimal.[^1][^2][^11]

## Manajemen Identitas untuk Agen Otonom

Identitas on‑chain adalah fondasi trust layer. ERC‑8004 menstandardisasi agentId sebagai tokenId ERC‑721 dan(tokenURI) sebagai pointer ke deskripsi/endpoint agen. Registrations[] mengaitkan agentId ke agentRegistry pada chain tertentu (eip155:chainId:address), memungkinkan federasi multi‑chain. Endpoints yang didukung meliputi A2A (agent‑card), MCP, ENS, DID, hingga dompet; supportedTrust mengekspos model kepercayaan yang dapat disediakan oleh agen. Metadata on‑chain yang ringan (contoh agentWallet) mempercepat filter/indexing UI dan komposisi contract, sementara payload kaya (deskripsi, dokumentasi) tetap off‑chain untuk efisiensi gas. TokenURI dapat diperbarui (commit‑reveal atau langsung), sementara event on‑chain (Registered, MetadataSet) menjaga jejak audit yang tidak dapat dihapus.[^1][^2][^4][^5][^12][^3]

Tabel 6 — Contoh Entri endpoints
| name | endpoint | version/capabilities |
|---|---|---|
| A2A | https://agent.example/.well-known/agent-card.json | 0.3.0 |
| MCP | https://mcp.agent.eth/ | 2025‑06‑18; capabilities: tools/prompts/resources |
| ENS | vitalik.eth | v1 |
| DID | did:method:foobar | v1 |
| agentWallet (metadata) | eip155:1:0x742d… | n/a |

Dalam praktik, kombinasi endpoints berguna untuk discovery lintas toolchain, sedangkan supportedTrust menentukan jalur trust: misalnya, hanya menerima tugas berisiko jika ada zkML atau TEE attestation.[^1][^3]

## Sistem Skor Reputasi untuk Kepercayaan Agen

Reputasi adalah sinyal publik yang dapat diolah menjadi score. ERC‑8004 menyimpan score 0–100, tag, dan hash file off‑chain on‑chain, sehingga setiap peserta dapat memverifikasi bahwa skor yang ditampilkan oleh UI sesuai dengan state on‑chain. Namun, agregasi yang kaya (misalnya, weighted scoring, de‑biasing Sybil, atau filter berbasis kualitas reviewer) dilakukan off‑chain untuk menjaga on‑chain tetap minimal. Desain ini mendukung komposabilitas: contract dapat mengandalkan getSummary untuk keputusan cepat, sementara indekser menyajikan metrics yang diolah dengan model yang lebih canggih.[^1][^2][^10]

Berikut beberapa strategi pembobotan yang lazim untuk produksi:

Tabel 7 — Strategi Agregasi Reputasi
| Strategi | Deskripsi | Kelebihan | Risiko |
|---|---|---|---|
| Average | Rata‑rata sederhana dari skor | Sederhana, mudah diaudit | Sensitif terhadap outlier/Sybil |
| Time‑Decay | Penalti terhadap feedback usang | Reflektif performa terkini | Parameter decay harus disetel hati‑hati |
| Reviewer‑Weighted | Bobot lebih besar untuk reviewer tepercaya | Kurangi spam, siapkan “trust of trust” | Diperlukan tata kelola reviewer |
| Validator‑Weighted | Bobot tinggi bila berasal dari validator | Kuat untuk tugas kritis | Validasi berbayar, konsentrasi insentif |
| Task‑Tag‑Specific | Skor per kategori/tag | Kontekstual, granular | Fragmentasi sinyal |
| Payment‑Weighted | Bobot dari proof_of_payment | Mengaitkan reputasi dengan insentif | Privasi, integrasi payment layer |

Desain off‑chain JSON di IPFS/HTTPS dapat memuat field tambahan (skill, context, task, capability) yang konsisten dengan A2A/MCP serta bukti pembayaran (proof_of_payment) untuk audit trail transaksi, sehingga reputasi tidak hanya mencerminkan kualitas hasil, tetapi juga kepatuhan finansial.[^1][^2][^22][^9][^10][^3]

Model reputasi berbasis blockchain yang lebih avanc例えば DEM‑BTRM (Dynamic Evaluation Mechanism – Blockchain‑based Trust and Reputation Model) dapat借鉴 two algoritma: DEWA (menggabungkan slow start, fast increase, fast/linear decrease jendela evaluasi) dan RHDA (peluruhan reputasi saat node tidak aktif) untuk mitigasi on‑off, DoS, re‑entry, Sybil, dan discrimination attacks. Prinsip ini—adaptasi jendela evaluasi dan peluruhan hierarkis—dapat diadaptasi ke agregasi off‑chain sinyal ERC‑8004.[^13][^14]

## Mekanisme Validasi dan Proses Verifikasi

ERC‑8004 tidak membatasi cara validasi; registri dirancang untuk mengakomodasi beragam model. Tiga model yang menonjol:

- Kripto‑ekonomi (stake‑secured re‑execution): validator mengulang pekerjaan dan berkomitmen pada outcome; insentif/slashing diatur di protokol validator (di luar registri). Cocok untuk tugas yang dapat diulang/diverifikasi ulang secara deterministik.[^1][^2]
- TEE (Trusted Execution Environment): agen dieksekusi di enklave, menghasilkan atestasi yang menautkan codeDigest, inputHash, outputHash, enclaveId, timestamp. Registri menyimpan status/response on‑chain; bukti atestasi disimpan off‑chain dan direferensikan melalui URI. Verifier dapat di‑off‑chain untuk menekan biaya on‑chain, sementara integritas tetap dapat diaudit.[^1][^2][^12][^15]
- zkML: bukti ZK yang menjaga privasi, memungkinkan verifikasi ringkas atas kebenaran komputasi ML tanpa re‑eksekusi atau asumsi hardware. Arsitektur seperti JOLT‑Atlas mengoptimasi untuk operasi ML (lookup terstruktur, sparsity, precompile khusus ML), mengurangi overhead ZKP secara signifikan.[^16][^17][^18]

Perbandingan ringkas ditunjukkan pada Tabel 8.

Tabel 8 — Perbandingan Model Validasi
| Model | Jaminan | Asumsi | Biaya Verifikasi | Privasi | Kematangan Implementasi |
|---|---|---|---|---|---|
| Stake‑Secured Re‑Execution | Ekonomi; hasil validator | Insentif/slashing validator | Rendah–Sedang (on‑chain) | Rendah | Siap pakai (contextual) |
| TEE Attestation | Hardware‑backed integrity | TEE stack, verifier | Rendah–Sedang (bukti off‑chain ref) | Tinggi ( enclave) | Produksi di beberapa vendor |
| zkML | Matematis (bukti ringkas) | Setup prover/verifier | Mikrodetik–Rendah (bukti ringkas) | Tinggi (input/model) | Menuju produksi (toolchain evolving) |

Integrasi ini—dengan event ValidationRequest/ValidationResponse—memungkinkan komposisi: aplikasi dapat memutuskan untuk melanjutkan hanya jika ada ≥N respons validator dengan skor di atas ambang, atau jika bukti zkML tersedia. Sinyal publik dari registri bertindak sebagai “akurasi probabilistik” sebelum eksekusi langkah kritis.[^1][^2]

## Integrasi dengan Jaringan Blockchain (EVM)

ERC‑8004 membutuhkan RPC, akundeployer, chainId, dan addresses registry. Penyebaran dapat dilakukan di mainnet/L2 (misalnya Base) dan testnet (Sepolia, Base Sepolia), dengan biaya pendaftaran yang rendah—contoh biaya pendaftaran Identity Registry di Base Sepolia sekitar 0.0001 ETH. Integrasi event‑driven dengan subgraph mengindeks Registered, NewFeedback, ValidationRequest, dan ValidationResponse untuk UI/analitik. Multi‑chain support dicapai melalui registrations[] (eip155:chainId:identityRegistry) dan referensi CAIP‑10 untuk identifikasi akun lintas chain. Sponsor gas untuk klien dapat memanfaatkan Account Abstraction (EIP‑7702) sehingga umpan balik dapat dikirimkan tanpa friksi注册, selama Autorization berlakuh feedbackAuth.[^1][^4][^7][^2][^5][^19]

Untuk mengilustrasikan, Tabel 9 memberikan ringkasan lingkungan dan biaya contoh (indicative).

Tabel 9 — Ringkasan Integrasi Jaringan
| Jaringan | RPC/Status | chainId | Alamat Registry (contoh) | Biaya Pendaftaran (contoh) |
|---|---|---|---|---|
| Base Sepolia (testnet) | Publik | 8453 | Identity: 0x8506…; TEE Ext: 0x03eC…; Verifier: 0x481c… | 0.0001 ETH (Identity) |
| Ethereum Mainnet/L2 | varies | varies | eip155:chain:address | Variatif (gas) |
| Local (Anvil/Hardhat) | Lokal | 31337 (contoh) | Dev deployments | N/A (local) |

Catatan: Alamat contoh dan biaya bersifat indikatif, berasal dari proyek rujukan TEE Agent; organistions harus memverifikasi alamat/versi kontrak saat deploy produksi.[^7][^4][^2]

## Best Practices untuk Manajemen Registri

- Efisiensi gas: simpan sinyal ringkas on‑chain, payload kaya off‑chain (IPFS/HTTPS) dengan hash integritas. Gunakan event sebagai sumber kebenaran untuk subgraph; hindari penyimpanan массив data pada storage contract.[^1][^2]
- Keamanan: gunakan commit‑reveal pada kasus pendaftaran sensitif (mitigasi front‑running), banyakc鳳 operator tepercaya, audit awal untuk mengunci ABI/event, dan verifikasi addresses untuk menghindari impersonation.  
- Anti‑Sybil: tetapkan kebijakan reviewer‑weighted dan/atau persyaratan stake untuk umpan balik ber‑impact tinggi; gunakan indexLimit/verifikasi signature untuk mencegah spam.  
- Operasional: gunakan versioning file registrasi, kebijakan retensi dan pinning IPFS, dan integrasi monitoring event agar downtime/inkonsistensi cepat terdeteksi.  
- Governance: tetapkan kebijakan upgrade/versi (misalnya, registry v1.x → v2.x), serta jalur kompatibilitas untuk agents yang sudah terdaftar.

Praktik‑praktik ini memanfaatkan sifat “public goods” dari sinyal on‑chain dan minimisme desain ERC‑8004 untuk menjaga biaya tetap rendah tanpa mengurangi integritas.[^1][^2][^6][^8]

## Studi Kasus & Implementasi Referensi

- Vistara Example: Menunjukkan alur multi‑agen dengan tiga peran (Server/Validator/Client), dari registrasi hingga validasi AI dan pengiriman feedback on‑chain, termasuk jejak audit lengkap. Kompatibel dengan jaringan EVM dan mendukung pipeline Foundry dan TypeScript/Python untuk agen.[^4]
- Phala TEE Agent: Menunjukkan integrasi TEE (Intel TDX melalui Phala CVM/dstack) dengan ERC‑8004: derived keys, code measurement, dan real attestation. Deployed di Base Sepolia, menyediakan ekstensi registri TEE dan verifier. Biaya pendaftaran Identity Registry sekitar 0.0001 ETH pada testnet yang dimaksud.[^7]
- Buildbear Walkthrough: Merangkum konsep ERC‑8004 dan langkah memulai bagi developer, membantu onboarding teknis ekosistem.[^19]
- Implementasi kontrak resmi:Repositori resmi ERC‑8004 contracts menyediakan baseline implementasi registry untuk berbagai testnet/mainnet, menjadi rujukan interoperabilitas lintas builder.[^12]

Studi kasus ini memperlihatkan bahwa pattern umum—registrasi, validasi, feedback—dapat disusun dengan beragam trust model, mulai dari reputasi alone, sampai kombinasi TEE/zkML untuk tugas yang memerlukan jaminan kuat.

## Analisis Keamanan dan Risiko

ERC‑8004 explicitly mengakui dua vektor risiko utama:

- Spam Umpan Balik dan Sybil: pre‑otorisasi melalui feedbackAuth mengurangi spam, namun tidak menghentikan serangan Sybil. Mitigasi: reputasi reviewer, stake untuk umpan balik kritis, filter berbasis komunitas, serta pembobotan validator pada agregasi akhir.[^1][^2][^6]
- Integritas vs Kapabilitas: ERC‑8004 memastikan bahwa file registrasi yang di‑link adalah Milik agen on‑chain, namun tidak dapat secara kriptografis membuktikan bahwa kapabilitas yang diiklankan selalu berfungsi/berbahaya. Trust model pluggable dirancang menutup gap ini—tetap memerlukan evaluasi operasional di luar standar.[^1]

Tambahan, konsistensi multi‑chain dan versioning registri adalah titik risiko operasional. Registri per chain, registrations[] multi‑chain, serta kebijakan kompatibilitas antar versi (v1 vs v1.1) perlu dikelola agar agen tidak “hilang” dari discovery UI. Kendali akses, audit event, dan pinning IPFS juga penting untuk mencegah corruption/offline content. Q selain itu, TEE membawa asumsi keamanan hardware/vendor dan suplai chain attestation, yang harus dievaluasi sesuai apetito risiko organisasi.[^1][^2][^6][^8]

Tabel 9a — Matriks Risiko → Mitigasi
| Risiko | Dampak | Kemungkinan | Mitigasi Teknis/Operasional |
|---|---|---|---|
| Spam/Sybil Feedback | Sedang–Tinggi | Tinggi | feedbackAuth, reviewer‑weighted, stake, proof_of_payment |
| TEE Attestation Chain | Sedang | Rendah–Sedang | Verifier off‑chain tepercaya, rotasi kunci, audit rantai atestasi |
| zkML Toolchain Maturity | Sedang | Sedang | Verifikasi bukti di off‑chain, fallback ke TEE/stake |
| Multi‑Chain Consistency | Sedang | Sedang | Singleton per chain, registrations[], subgraph monitoring |
| front‑running tokenURI | Rendah–Sedang | Sedang | commit‑reveal, lelang/penamaan kebijakan |
| Key Management | Tinggi | Rendah–Sedang | HSM/kolokasi kunci, kebijakan rotasi, akses minimal |

## Roadmap Implementasi dan Rekomendasi

Tahapan implementasi yang disarankan:

1) Infraestructura dasar: deploy IdentityRegistry (singleton), siapkan tokenURI JSON (IPFS), definisikan endpoints dan supportedTrust.  
2) Integrasi A2A/MCP: aktifkan endpoint discovery agar agen dapat ditemukan dan diinteraksi melalui toolchain favorit.  
3) Trust model pilihan:  
   - Reputasi dulu: aktifkan ReputationRegistry, tanda tangani feedbackAuth, dan bangun aggregator off‑chain.  
   - Tambahkan TEE untuk tugas sensitif: integrasikan pipeline enclave (contoh ROFL/TDX), simpan attestation URI off‑chain, poskan ValidationResponse.  
   - Evaluasi zkML untuk privasi/keterbatasan hardware: jika toolchain sudah matur, gunakan zkVM untuk bukti ringkas dan audit trail kriptografis.  
4) Operasional: indekser/subgraph, monitoring event, kebijakan governance versi registry.

Rekomendasi tim:  
- Developer: gunakan repositori kontrak resmi dan contoh Vistara untuk bootstrapping; observasi event di subgraph; uji网络上 sebelum produksi.  
- Product/Compliance: pilih trust model yang sesuai nilai tugas; untuk domain teregulasi, prioritaskan TEE/zkML dan auditability.  
- Security/Auditor: lakukan reviewABI/event, verifikasi feedbackAuth, audit pipeline TEE/verifier, dan kebijakan retensi/pinning IPFS.  
- Ekosistem: align endpoints dengan A2A/MCP, gunakan CAIP‑10 untuk akun lintas chain, rujuk RFC 7071 untuk skema reputasi, dan siapkan integrasi x402 untuk bukti pembayaran yang audit‑friendly.[^1][^3][^10][^2][^22]

## Keterbatasan Informasi (Information Gaps)

- Detail antarmuka dan ABI final lintas versi EIP‑8004 dapat berubah sebelum “Final”; beberapa sumber komunitas perlu verifikasi silang dengan spesifikasi resmi terkini.  
- Belum tersedia data benchmark biaya gas lintas L2/mainnet untuk operasi registri (registrasi, metadata, feedback, validasi).  
- Referensi stabil untuk pipeline zkML produksi (prover/verifier, toolchain) masih berkembang; rekomendasi akan matang seiring toolchain scaling.  
- Detail implementasi spesifik vendor TEE (ROFL, Intel TDX, AMD SEV‑SNP, AWS Nitro) bervariasi; panduan umum perlu dilengkapi per‑provider.  
- Biaya operasional, SLA, dan aspek on‑chain/off‑chain verifier untuk atestasi belum terdokumentasi penuh di produksi.  
- Tidak ada data kuantitatif performa validator kripto‑ekonomi (latency, slashing rate) yang direferensikan di sumber utama.  
- Dampak Long‑term storage dan pinning IPFS terhadap biaya Total Cost of Ownership (TCO) memerlukan observasi produksi berkelanjutan.  
- Kebijakan tata kelola/adjudikasi untuk abuse/spam umpan balik (Selain pre‑otorisasi dan sinyal publik) masih memerlukan praktik terbaik yang mapan.  
- Rincian integrasi account abstraction (EIP‑7702) untuk sponsor gas klien di ekosistem luas memerlukan pedoman implementasi.  
- Standar interoperabilitas off‑chain untuk format atestasi TEE/verifier lintas vendor belum diseragamkan.

## Penutup

ERC‑8004 menawarkan fondasi trust layer yang pragmatis untuk ekonomi agen: ringan on‑chain, fleksibel off‑chain, dan dapat diadaptasi ke spektrum risiko yang luas. Dengan identitas yang portabel, reputasi yang dapat diaudit, dan validasi yang pluggable, ERC‑8004 mempercepat menuju ekonomi agen yang tidak terikat pada vendor atau walled garden—serta membuka ruang bagi inovasi di atas standar yang sama. Keberhasilan adopsi bergantung pada disiplin implementasi (event‑driven indexing, governance versi), pemilihan trust model yang tepat, serta investasi pada toolchain TEE/zkML sesuai kebutuhan. Sejalan dengan evolusi ekosistem, standar ini berpotensi menjadi lapisan koordinasi utama untuk interaksi agen yang terbuka, dapat diaudit, dan dapat diskalakan.

---

## Referensi

[^1]: ERC‑8004: Trustless Agents - Ethereum Improvement Proposals. https://eips.ethereum.org/EIPS/eip-8004  
[^2]: A curated list of awesome resources for ERC‑8004. https://github.com/sudeepb02/awesome-erc8004  
[^3]: A2A Protocol Specification. https://a2a-protocol.org/latest/specification/  
[^4]: vistara-apps/erc-8004-example. https://github.com/vistara-apps/erc-8004-example  
[^5]: ERC‑721: Non‑Fungible Token Standard. https://eips.ethereum.org/EIPS/eip-721  
[^6]: RFC 2119: Key words for use in RFCs to Indicate Requirement Levels. https://www.rfc-editor.org/rfc/rfc2119  
[^7]: Phala‑Network/erc-8004-tee-agent. https://github.com/Phala-Network/erc-8004-tee-agent  
[^8]: erc-8004/erc-8004-contracts. https://github.com/erc-8004/erc-8004-contracts  
[^9]: RFC 7071: Media Types for Reputation Reports. https://datatracker.ietf.org/doc/html/rfc7071  
[^10]: CAIP‑10: Chain Agnostic Account IDs. https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md  
[^11]: ERC‑1271: Standard for Signature Validation in Smart Contracts. https://eips.ethereum.org/EIPS/eip-1271  
[^12]: ERC‑191: Signed Data Standard. https://eips.ethereum.org/EIPS/eip-191  
[^13]: A Blockchain‑based Trust and Reputation Model with Dynamic Evaluation Mechanism (DEM‑BTRM). https://www.sciencedirect.com/science/article/pii/S1389128622004388  
[^14]: The Case for AI‑Based Web3 Reputation Systems. https://research.protocol.ai/publications/the-case-for-ai-based-web3-reputation-systems/psaras2021.pdf  
[^15]: Oasis Protocol ROFL (TEE) Docs. https://docs.oasis.io/build/rofl/  
[^16]: Trustless Agents — with zkML. https://blog.icme.io/trustless-agents-with-zkml/  
[^17]: JOLT‑Atlas (zkVM for ML) GitHub. https://github.com/ICME-Lab/jolt-atlas  
[^18]: IACR ePrint 2023/1217 (JOLT). https://eprint.iacr.org/2023/1217  
[^19]: ERC‑8004: Trustless Agents with Reputation, Validation & On‑Chain Agents - Buildbear. https://www.buildbear.io/blog/erc-8004  
[^20]: x402 Payment Standard. https://www.x402.org/  
[^21]: Ethereum Attestation Service (EAS). https://attest.org/  
[^22]: How ERC‑8004 will make Ethereum the home of decentralized AI agents - CryptoSlate. https://cryptoslate.com/how-erc-8004-will-make-ethereum-the-home-of-decentralized-ai-agents/