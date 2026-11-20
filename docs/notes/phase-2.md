# Phase 2 — Ba hòn đảo: change specification

Analysis only, 2026-11-20. Ticket-02 đã được người dùng bổ sung trong lúc khảo sát và đã đọc đầy đủ; blocker thiếu file ban đầu đã hết. Ưu tiên Ticket-02 > PRD-0 ở phần không bị thay > giả định có nhãn. TEST_CONTRACT_SPEC là draft; v1.0 chính thức vẫn NOT VERIFIED.

Baseline main 95aa97ee3bc0baf9fb4e2f4c14644264e681995b; tag phase-1 627ed7f92c59482bc902fba108c2936dc9481976. Unit18/18, independent21/21, Ubuntu success là baseline, không phải evidence Phase2. Không sửa production code, requirements, tests, contract, CI, evidence hoặc tag. ID P2-* dưới đây là mã RTM nội bộ.

## Change Impact Matrix

Module: C=config/game.js; W=data/night-1.js và map descriptors mới; G=core/game.js; H=headless/adapter.js+CLI; M=game.contract.json/write-contract; B=browser/main.js/style.css; V=verify/scenarios/preflight/CI. TC/IQ là tests/game.test.js và independent suite hiện hữu; VAL=validation.test.js; HT=headless.test.js.

| Requirement ID / nguồn | Previous behavior | New requirement | Change type | Affected modules | Affected tests |
|---|---|---|---|---|---|
| P2-TICK §1 | Pipeline gộp, không pause/sim_tick | 60Hz, đúng12bước, tick khác sim_tick khi pause | MODIFIED | G,H,V | TC14,HT; ordering mới |
| P2-MOVE §1 | Run6,jump6,gravity−18 | Run6, phản hồi≤.1s, air control; jump7,gravity−20 | MODIFIED | C,G,B | TC02,IQ8hướng/jump |
| P2-DASH §1 | Không dash | 14m/s,12ticks,cd90fromstart; air giữY, không bất tử | NEW | C,G,H,M,B | Dash/edge/timer mới |
| P2-MOTES §1 | 40motes,+10pickup,respawn15s,túi vô hạn | Túi10,initial20/cap30,spawn240k,height1.5 | REPLACED | C,W,G,H,M,B | TC03,IQpickup,VAL |
| P2-LAMP §1 | Cost5,nạp trọn | Cost10,nạp tích lũy min(carried,missing) | REPLACED | C,G,H,M,B | TC04/05,IQlamp/score |
| P2-SAFE §1 | r5,repel,player protected | r6 ngăn quái ngoài,đẩy quái trong≤30ticks/no hit | REPLACED | C,G,W,B | TC10,IQsanctuary |
| P2-PULSE §1 | Cost2/r6/cd1,flee2s | Cost3/r5/cd3,3D latch,stun120/push4m15ticks | REPLACED | C,G,H,M,B | TC08/09,IQglow |
| P2-SHADE §1,4 | 4 từ tick0,speed2.5,numeric id | Spawn300,speed4/4.5,detect12/drop18,S IDs,5states | REPLACED | C,W,G,H,M,B | TC01/06/07,VAL,IQ |
| P2-HIT §1 | HP100,−10,cooldown60 | Flames3,−1,drop-half,invuln90,recoil2m60ticks | REPLACED | C,G,H,M,B | TC07/12,IQcontacts/tie |
| P2-FALL §1 | Clamp biên,y≥0 | Y<−10,loss once,wait60,respawn/invuln90 | NEW | W,G,C,H,B | Thay boundary TC02;fall/reset mới |
| P2-END §1 | Không deadline,một đêm | 300/330/360s; no_flames > clear > dawn | MODIFIED | C,G,H,M,B | TC11/12,IQterminal |
| P2-SCORE §1 | +10pickup/+100lamp/+500win | +10deposited/+100lamp/+5shade pulse,time/flame bonus,sum won nights | REPLACED | G,H,M,B | TC03/11,IQscore,routes |
| P2-MAPS §2 | Flat r30,5lamps vòng18 | 3maps,5/6/7lamps,cầu/dốc/pads/tower,rơi ngoài | REPLACED | W,C,G,B | TC01/02,IQboundary,all routes |
| P2-WIND §2 N3 | Không gust | Every30s,5sactive,2m/s,random direction,cue2s | NEW | C,G,H,W,B | Wind/pad/dash schedules |
| P2-DRIFTER §3.1 | Không Gió Lạc | N2/3,steal/flee/drop,max2 | NEW | C,W,G,H,M,B | FSM/VAL/same-tick mới |
| P2-CHARM §3.2 | Không Bùa Gió | Buff600,run7.2,dash no cd,respawn2700 | NEW | C,W,G,H,M,B | Buff/pickup/expiry mới |
| P2-PROGRESS §3.3 | Start/play/end/restart1night | Menu/intro Ông Đăng/results/next/Dawn;retry current | NEW | G,B,H | TC13,session/UI journeys |
| P2-PAUSE §3.4 | Không pause | Esc/P,frozen sim,resume/retry/settings/menu | NEW | G,H,B | Pause/input/timers mới |
| P2-SETTINGS §3.5 | Không persistent settings | Volume/mouse sensitivity lưu giữa lần mở | NEW | B | Browser storage/reload |
| P2-AUDIO §3.6 | Không audio | BGM+SFX+countdown10s,gust warning | NEW | B | Audio event/browser/listening |
| P2-HUD §3.7 | HP/light/score/lamps text | Flames/clock/10slots/cooldowns/context/offscreen arrow | MODIFIED | B,G snapshots | UI/visual mới |
| P2-ART §3.8 | Tự chọn palette/ambient | RGB±10%,ambient .15+.55×progress | REPLACED | B | Material/color/ambient tests |
| P2-CON §4 | internal-draft-1,fixed arrays,file-only CLI | v1.1 delta,night1..3,newfields/events,headless≤30s | MODIFIED | H,M,G,V | HT/VAL/TC14/15 |
| P2-DOD | Phase1 proof | Per-feature scenarios,hidden regression số chuẩn,≥30FPS1280×720 | MODIFIED | V,B,docs/harness | CI/RTM/perf |
| P2-ARCH | Shared plain ESM core/no DOM | Giữ shared core/browser/headless adapter độc lập | UNCHANGED | G,H,B | Import/parity |
| P2-STYLE PRD | Mây nón lá+đèn,không bạo lực,original assets | Giữ; sáng tạo không đổi chuẩn/headless | UNCHANGED | B,credits | Visual/regression |

## Tuning chuẩn

60Hz; đơn vị mét/giây; Y lên. Tick conversions là đổi đơn vị chính xác.

| Nhóm | Giá trị bắt buộc |
|---|---|
| Movement | Run6.0m/s; tăng tốc/dừng≤.1s=6ticks; full air control; jump vy7.0; gravity−20; jump chỉ grounded |
| Dash | 14m/s,.2s=12ticks,cd1.5s=90ticks từ start; move direction hoặc facing nếu đứng; air giữ độ cao; không bất tử |
| Motes | Túi10; pickupXZ≤1,height feet-vs-localground≤1.5; initial20 điểm khác nhau; cap30; spawn+1 mỗi240ticks nếu dưới cap và còn điểm trống |
| Lamps | Cost10; mỗi press min(carried,10−progress),progress giữ; radius2; chỉ unlit,nearest rồi id nhỏ |
| Safe | Lit r6; quái ngoài bị chặn mép; quái trong lúc lit bị đẩy ra≤30ticks,no damage lúc đẩy |
| Pulse | Cost3/r3D5/cd3s=180ticks; center feet+(0,.8,0),latch targets ngay activation; stun120; first15ticks horizontal push4m,stop obstacle,coincident +X; re-pulse refresh; không chết |
| Shades | Speed4.0,N3=4.5; detect12/abandon18; contactXZ≤1,height≤1.5; max1flame hit/tick; hit source recoil2m/60ticks; chạm invuln không làm gì |
| Shade schedule | 2 at300; thereafter1 at300+interval×k,k≥1; interval480/420/360,caps6/8/10; skip no validpoint; S1,S2,… spawn order |
| Hit | −1flame; drop floor(carried/2) on ring1.5–2.5m,TTL480,pickup earliest nexttick; invuln90 |
| Fall | Y<−10 once ignores invuln; −1flame,lose allbag; wait60 no pickup/contact; respawn atstart vel0/invuln90; zero flames immediate loss/no respawn |
| Flames/time | Flames3 full eachnight; durations300/330/360s=18000/19800/21600ticks |
| End priority | Flames0→no_flames always; alive+alllit→win even time0; otherwise time0→dawn |
| Score | +10/mote deposited;+100/newlamp;+5/shade/pulse including already stunned; win +floor(secondsLeft)×2+50×flames; game total=sum won nights |
| Gust N3 | Every30s=1800ticks,active5s=300ticks,randomheading,push2m/s,cue leaves+sound2s=120ticks before |
| Drifter | N2/3 only,max2,spawn1200k; D1,D2,…; idle2m/s,chase/flee7; chase if bag≥5 anddistance≤15,else idle; contactXZ≤1.2 steals min(3,bag) once; flee240 then removed withloot; pulse fleeingloot dropsall,removed after120 |
| Charm | C1/C2,pickup like motes; buff600 refresh;run7.2;dash no cd but freshpress,ignore duringdash,speed14/duration12 unchanged;respawn2700 |
| Performance | Headless≤21600ticks in≤30wallseconds; normal browser avg≥30FPS at1280×720 |

Palette exact hex preferred; allowed deviation≤10% per RGB source channel (clamp0..255), audit base sRGB materials/UI rather than lit screenshot pixels: sky #0E1430; fog #1B2350; grass #2F5D50; sand #C9B48A; wood #6B4A2F; seaofclouds #12384A; litlamp #FFB347/core #FFE9B0/unlit #5B5F6E; mote core #FFF6C2/halo #FFE58A; shadebody #120A1A/outline #7A3CFF/stunned #3A3450; áoMây #E8E2D0/scarf+charm #C8102E; goldborder+score #F2C14E; drifter #8FA3B8; danger #FF5A5F; UItext #F5F1E6. Ambient=.15+.55×(lit/total), endpoints .15/.70. Other details free, no extra gameplay planned.

## Map specification

Shared descriptors for support surfaces/colliders/rendering; no invented decorative colliders. Polar angle from+X CCW topview as source; proposed implementation x=cx+r cosθ,z=cz+r sinθ (A1). Keep formula precision; retain cartesian literals exactly.

| Night | Terrain | Player spawn | Lamps source order→IDs |
|---|---|---|---|
| 1 Đảo Bến | Center(0,0,0),diskr40,Y0;outside falls | (0,0,0),facing+Z | L1(0,0,25),L2(23.8,0,7.7),L3(14.7,0,−20.2),L4(−14.7,0,−20.2),L5(−23.8,0,7.7) |
| 2 Đảo Cau | Disksr28 atA(0,0,0),B(70,0,0);bridge x[26,44],z[−2,2],Y0,no rails | Source absent; A2 proposed(0,0,0),+Z | L1(0,0,20),L2(17,0,−10),L3(−17,0,−10),L4(70,0,20),L5(87,0,−10),L6(53,0,−10) |
| 3 Đảo Chuông | Diskr45,Y0;tier1Y3,r12..24,z>0;tier2Y6,r≤8;verticalwalls cannot walkup,stepoff falls;center tower r2,height8 onY6 (top14),unclimbable | Source absent; A2 approved spawn(0,0,−30),+Z | L1(0,6,6),L2(18,3,10),L3(−18,3,10),L4(35,0,−10),L5(−35,0,−10),L6(20,0,−35),L7(−20,0,−35) |

N2 pads r1 at(20,0,18),(50,0,−18): vy14 and horizontal24 toward OTHER islandcenter; launch vector held until grounded, move keys cannot override; dash still allowed. Same-height flight2×14/20=1.4s; derived landings≈(51.61,0,6.62)/(18.39,0,−6.62), inside destinationdisks (checks, not new canonical positions).

N3 ramps: width3,angles30°/150°,bottomr30Y0→topr24Y3. Derived endpoints(25.980762…,0,15)→(20.784610…,3,12), mirroredX negative at150°. Linear supportheight along ramp. Pad r1 at(0,3,13): vy12,horizontal8 toward−Z,held untilland; descending tier2 crossing≈.845s,z≈6.24. Tower solid blocks movement; do not turn all raised terrain into one heightfield that teleports player upward. Test sidewalls/underside/support explicitly.

| Night | Mote candidates | Shade candidates | Other entities |
|---|---|---|---|
| 1 | 8r12 at0+45k,k0..7;16r33 at0+22.5k,k0..15;Y0,total24 | 12r37 at15+30k,k0..11,Y0,distance toplayer≥15;interval480/cap6 | No drifter/charm/gust |
| 2 | Percenter4r10 at0/90/180/270;8r22 at0+45k,k0..7,Y0;total24 | Percenter8r26 at22.5+45k,k0..7,Y0;total16;interval420/cap8 | C1(35,0,0);drifter1200k,max2;mistpoints unspecified(A4) |
| 3 | 18r34 at0+20k,k0..17,Y0;8r18 at20+20k,k0..7,Y3;4r5 at45+90k,k0..3,Y6;total30 | 16r43 at0+22.5k,k0..15,Y0;interval360/cap10 | C1(30,0,25),C2(−30,0,25);drifter1200k,max2;gust as tuning |

Initial20 distinct candidates need seeded selection policy(A3). N1/2 have24 candidates: full occupancy skips spawn even belowcap30. Dropped motes do not create permanent polar spawn slots. Do not change any source position to resolve ambiguity; names/IDs for candidates are internal until contract known.

## Fixed tick pipeline: exact12steps

1. Read input; process pause first; if just paused stop here.
2. Decrement time, cooldowns, invulnerability, stun, charm, droppedTTL, charmrespawn.
3. Move player (jump,dash,pad,wind); then check fall.
4. Pick up motes and charms.
5. Interact with lamps.
6. Update safe zones.
7. Pulse.
8. Move shades and drifters.
9. Contacts: drifter steals first, then shade hits in increasingID order.
10. Spawn motes/shades/drifters byschedule; newentities interact earliest nexttick.
11. Evaluate win/loss.
12. Record snapshot if scheduled.

Paused: tick still increases; sim_tick,time,CD,spawn,TTL freeze; snapshot state="paused". Pause-entry step1 earlyreturn versus scheduled snapshot needs finalization interpretation(A5), not omission. Timers/spawns use simulationtime, not wallclock/renderFPS. Targets latch once atstep7; no entity spawned step10 is target earlier thattick. Step4pickup may fundstep5deposit/step7pulse; deposit consumes beforepulse; litlamp protection precedescontact. Use boundary tests n−1/n/n+1.

## State machines (internal concepts unless explicit official enum)

| Actor | States/transitions/guards |
|---|---|
| Player | grounded↔airborne via jump/support/landing; pad flight holds horizontalvector untilground; dashoverlay starts on freshpress ifinactive andcdready ORcharm,latched direction,12ticks/airYheld. Y<−10→respawn_wait,applyfallloss once ignoringinvuln;zero flames→lost;else60simticks→start,vel0,invuln90. Waiting excludes pickup/contact;movement/action exclusion assumptionA5 |
| Shade official names | spawning→wander(nexttick activation; unspecified extra delayA4);wander→chase detect≤12;chase→wander beyond18;validhit→recoil2m/60ticks;pulse→stunned120+push15ticks;repulse refresh;expiry→eligiblewander/chase. Safe-zoneeviction flag/constraint,not invented enum. Stun/recoil/eviction contact prioritiesA4 |
| Drifter | idle2→chase7 ifbag≥5 anddistance≤15,conditionlost→idle;contact→flee7 withmin(3,bag) once;240ticks→removedwithloot. Pulsechase→flee no theft;pulseflee carrying→dropall atspot,removeafter120. Safezone/invuln neverpreventtheft. idle/emptyfleepulse gapA4 |
| Charm | available→unavailable onpickup;buff600 refresh;respawn2700→available;effectexpires→normalrun/cd policyA6;dashpress duringactive ignored;holding doesnotretrigger |
| Pause | running↔paused onfalse→trueedge;Esc/P map same logicalaction;UI resume/retry/settings/menu remainusable;resume boundaryA5 |
| Night/session | mainmenu→intro(name+Ông Đăng dialogue)→playing→results;winN1/N2→nextintro;winN3→BìnhMinh(sum won scores);loss→retry sameNight;newNight flames3;carry/resetA7 |

## Acceptance Criteria / RTM / test plan

All following tests PLANNED/NOT RUN. For every case save clause/config/night/seed/input/expected/actual/command/exit/SHA/environment and failed attempts. No hidden v1.0 regression available: our18/21 tests do not prove official DoD. Map replaced assertions to Ticket; preserve old evidence, update tests with rationale rather than force old expected numbers.

| Requirement | Verifiable AC | Test/layer | Evidence planned |
|---|---|---|---|
| TICK | Sameactions/seed→same snapshots/events;12steporder;tick/sim_tick pause divergence | P2-T01 core+CLI | ordered trace,replaydiff |
| MOVE/DASH | Reach6/stops≤6ticks;no diagonalboost/fullair;groundedjump7;dash14/12/cd90fromstart;idleusesfacing;airYheld,stillhittable | P2-T02 headless/unit | trajectories,edges |
| MOTES | Initial20distinct;bag≤10;inclusiveXZ1/height1.5;fullbag leavesmote;240k/freepoint/cap;droppedearliestnexttick/TTL480 | P2-T03 core | pickup/spawn/TTLboundaries |
| LAMP/SAFE | Progressmin/tie/id/litnorepeat;shadeoutside nevercrosses6;insideeviction≤30/nohitduring | P2-T04 core | deposit/tie/evictiontrace |
| PULSE | Cost3/cd180;insufficientnoeffect;latch3Dtargetset;stun120/push4m15ticks;wallstop/+Xcoincident;refresh;+5eachshadeeachpulse | P2-T05 core | targetset,push,score |
| SHADE/HIT | First2at300,thenexactinterval/cap/validpoint/IDs;detect12/drop18;firsteligibleIDonlyhit;invulnnohit/recoil;dropfloorhalf/ring1.5..2.5/TTL480 | P2-T06 core | spawn/FSM/contacttrace |
| FALL | Y=−10none,<−10oneloss;ignoreinvuln;emptybag;wait60nopickup/contact;spawnvel0/invuln90;zeroimmediateloss | P2-T07 core | fall/wait/repeatcases |
| END/SCORE | Exacttime;no_flames overridesclear/dawn;aliveclearattime0wins;else dawn;deposit/lamp/pulse/time/flamescore;totalonlywon | P2-T08 core | tiecases,expected arithmetic |
| MAPS/WIND | Exactdescriptorpositions;traversebridge/ramps/pads,stepofffalls,towerblocks;gust1800k/300active/120cue/2m/s | P2-T09 core+browser | mapsaudit,routes,gusttrace |
| §3.1 DRIFTER | N1none,N2/3spawn1200k/max2;threshold5/15inclusive,conditionlostidle;XZ1.2stealoncebeforehit;pulsechaseflee,pulseflee-lootdropall/120remove,ordinaryflee240;safe/invulnno protection | P2-T10 dedicatedheadless+UI | fullFSMscenario,same-tick |
| §3.2 CHARM | ExactCpositions/IDs;pickupmoterule;600refresh/run7.2;no dashcd butfreshpress,activepressignored;still14/12;2700respawn | P2-T11 dedicatedheadless+UI | buff/expiry/repick/pause |
| §3.3 PROGRESSION | Actual3nightsequence/menu/intro/results/next;retryloss sameNight;DawnonlyafterN3,totalwon sum | P2-T12 dedicatedheadless+browser | journey/reset/score |
| §3.4 PAUSE | Esc/Pedge;sim/time/CD/TTL/spawnfreeze,butscheduledpausedsnapshot/tickadvance;resume/retry/settings/menu;noinputstuck/catchup | P2-T13 dedicatedheadless+browser | pause/resumetraces/UI |
| §3.5 SETTINGS | Changevolume/sensitivity,reopengame→retainedandapplied;corruptpersisteddatahandled | P2-T14 browser | storage/reload/camera/audio |
| §3.6 AUDIO | BGMnight+pickup/lamp/pulse/hit/jump/dash/win/lose/shade-spawn/countdownlast10;gustcue2early;volumeapplies | P2-T15 browser+eventunit | eventtosoundlog,listeningrecord |
| §3.7 HUD | FlamesUL;mm:ssTCredblink≤30s;lamps/scoreUR;10slotsBC;dash/pulsecdBR;nearunlit E x/10;offscreenarrownearestunlit | P2-T16 browser | HUDthreshold/screenshots |
| §3.8 ART | AlllistedbaseRGBwithin10%;ambient=.15+.55lit/n atallprogressvalues | P2-T17 material+visual | channelchecks,nightshots |
| CON | Exactknowndeltafields/events;invalid/null/NaNreject;overridesreplacedefaults;night1..3;edgesnotheld;stdoutJSON/errors;replay;21600ticks≤30s | P2-T18 CLI/VAL/benchmark | mapping,malformedmatrix,timing |
| DOD/ARCH | Per-new-simfeatureheadlessscenario (dash/fall/wind too),sharedcore/noDOM;actualnormalavg≥30FPS1280×720 | P2-T19 CI/perf/import | featurecoverage,RAF/hardware |

UI-only settings/audio/HUD/palette requirebrowser evidence,not fakeheadlessfields. Provide underlyingevent/timerheadless coverage whereapplicable; do not claim JSON verifies audible sound. Need official harness for hidden Phase1 regression with standardized tuning.

Same-tick expected frompipeline: pause+dash→dashblocked;step4charm cannot changealreadycomputedstep3movement thattick;step4pickupfundsstep5/7;depositbeforepulsecanleaveinsufficientbag;litlampstep6protectsbeforecontact;step7stunbeforestep8/9suppressesattack(A4);drifterstealsbeforehitdrop-half;newstep10entitieswaitnexttick;zero-flames+alllit+time0→no_flames;aliveclear+time0→win. Explicit assumptioncases: fall+finaldeposit,respawn+spawn,expiry+dash,pulse+recoil/eviction,wind+pad/dash,pause-entrysnapshot,eventorderingmultitarget. Also testS2vsS10numericspawnorder,bridgeedgedashtunnelling,slopesupport,raisedterrainunderside,knockbackwallstop,restartno residualtimers/events/listeners. Tests changed dueTicket must recordwhichclause replacesoldexpectation;keep baseline scenarios/evidence immutable.

## Contract v1.1: exact known delta, NOT complete schema

| Location | Published keys/semantics |
|---|---|
| Manifest | contract_version:"1.1";tuning matches§1;add dash_speed=14,dash_duration_s=0.2,dash_cooldown_s=1.5,night2_duration_s=330,night3_duration_s=360 |
| CLI | --night accepts1,2,3;other invocation unknown |
| Snapshotroot | night;wind{active,dir_deg};paused state:"paused" |
| Snapshotplayer | vel,grounded,invuln,dash_cd_s,pulse_cd_s,charm_s |
| Requiredarrays | motes records{id,pos,kind=random/dropped,ttl_s};drifters{id,pos,state,stolen};charms{id,available,respawn_s} |
| Scenario | player.{invuln_ticks,dash_cd_ticks,pulse_cd_ticks,charm_ticks};shades[].{state,state_ticks_left};drifters,charms replace defaults;flags random_drifters,wind_enabled |
| Input | dash,pause false→trueedge |
| Newevents | dash{};charm_picked{charm_id,charm_ticks};drifter_steal{drifter_id,amount,carried};drifter_drop{drifter_id,amount};night_start{night};paused{};resumed{} |
| Existingevent | player_hit duefall adds lost |
| Shadeenum | spawning,wander,chase,recoil,stunned (exact) |
| Budget | ≤21600ticks completeNight in≤30s |

Missingv1.0 base: fullmanifest/tuningkeylist,CLI/scenarioenvelope,seed/RNGalgorithm,eventenvelope/timestamps/order,snapshotcadence,rounding/errors. Delta doesnotdefine pos/vel objectvsarray,invuln type/unit,non-dropped ttl_s representation,player_hit.lost semantics,scenario drifter/charm shapes,moteIDs. Do not inventtheseorclaimofficial1.1compliance. internal-draft-1 wrapper{version,state},health/light/status,enemies/fireflies,numericID=index are notconfirmedofficialaliases. Currentfixedcounts,inputallowlistandper-recordvalidatorsmustadapt to3nights/newfields. KeepsemanticcoreseparatefromH/Mfieldmapping;confirmknownv1.1deltaindependentlyofunverifiedv1.0. Build fieldmatrix clause→JSONpath→type/unit/enum→required/default→validator/test oncebaseobtained. Do not merelyrename internalversionto1.1.

## Minimal assumptions / clarifications (not canonical changes)

| ID | Gap | Proposed policy for user review |
|---|---|---|
| A1 | Hướng tọa độ và mép địa hình | Dùng x=r cosθ,z=r sinθ; bao gồm mép đĩa/khoảng bán kính, riêng z>0 là nghiêm ngặt. Chọn mặt đỡ có thể tiếp cận, không tự dịch chuyển lên tầng. Đối chiếu ví dụ chính thức khi có. |
| A2 | Spawn người chơi Đêm 2/3 chưa quy định | ĐÃ DUYỆT: Đêm 2 (0,0,0), hướng +Z; Đêm 3 (0,0,-30), hướng +Z. Không thay tọa độ canonical của các đối tượng khác. |
| A3 | RNG, cap và đom đóm rơi | RNG có seed; ứng viên vòng trong trước vòng ngoài, A trước B; chọn20 điểm không lặp. Đề xuất cap30 chỉ đếm random, không dropped. Rải dropped bằng vị trí có mặt đỡ trong vành chuẩn; cần xác nhận fallback ra biển. Không coi RNG nội bộ là chuẩn contract. |
| A4 | AI và tâm mục tiêu chưa rõ | ĐÃ DUYỆT: wander, spawn selection, wind seeded. Gió Lạc chọn điểm sương hợp lệ từ map; implementation dùng shade spawn points hợp lệ và ngưỡng nội bộ 15m do Ticket chưa chốt source point. Tâm pulse = chân Mây+0.8m; tâm Bóng Mực = entity Y+0.75m; không cộng độ cao hai lần. Shade spawning tương tác từ tick sau; stun/recoil/eviction không hit. |
| A5 | Pause snapshot và respawn wait | ĐÃ DUYỆT: pause đóng băng toàn bộ simulation timers, spawn, TTL, cooldown và charm; tick tường vẫn tăng. Ghi paused snapshot theo cadence. Respawn wait bỏ movement/pickup/deposit/pulse/contact; hồi sinh sau đủ60 sim ticks với invulnerability90 ticks. |
| A6 | Dash kết hợp pad/gió/bùa | ĐÃ DUYỆT: air dash giữ nguyên độ cao; không hủy pad launch và tiếp tục vận tốc phóng sau dash nếu chưa tiếp đất. Gió cộng vận tốc ngang2m/s như external force trong dash/pad flight. Charm bỏ cooldown dash khi còn hiệu lực, nhưng vẫn yêu cầu rising edge; input dash khi đang dash bị bỏ qua. |
| A7 | Chuyển đêm/reset/điểm/IDs | ĐÃ DUYỆT: campaign progression, điểm đêm thắng và settings nằm ngoài state một đêm. Retry chỉ reset đêm hiện tại, không mất/cộng trùng điểm đã thắng. Đêm mới reset HP/Ngọn Lửa, inventory, cooldown, timer, đèn, enemy, charm và dropped motes. |
| A8 | UI/audio/settings/performance | Đề xuất Shift dash,Q pulse,E deposit; localStorage có version, kiểm dữ liệu lỗi, volume0..1/sensitivity; WebAudio/procedural SFX mở sau user gesture, pause audio theo game. Clock ceil giây còn lại, blink2Hz, countdown mỗi giây10..1. Đề xuất mẫu FPS60s chơi thật sau warmup1280x720, không screenshot, ghi GPU/renderer. Benchmark phải thực thi đủ21600ticks hợp lệ, không lấy thua sớm thay đủ đêm. |

Các quyết định A2/A3/A4/A5/A6/A7 đã được người dùng duyệt và áp dụng. A1 (polar convention/boundary inclusion) và A8 (UI detail/persistence/FPS method) còn là lựa chọn nội bộ cho workstream sau; không thay dữ liệu Ticket. Cần tài liệu nền v1.0 và kiểu dữ liệu còn thiếu trước khi chốt official adapter.

## Implementation plan sau khi duyệt spec

**Nhóm A — Core/maps/physics/gameplay/contract/headless:** Chốt giả định và tests bị thay; config và map descriptors chuẩn; tests tọa độ/mặt đỡ; state/timers/pause/pipeline12bước; collision/pad/dash/fall; motes/deposit/safe/pulse/shades; drifter/charm/gust/session/score; mapping v1.1 tách phần v1.0 chưa biết; headless theo tính năng, cùng tick, validation, replay, Ubuntu, benchmark21600ticks. Chỉ tách module khi cần, không viết lại nền tảng hay tạo ECS.

**Nhóm B — Browser/rendering/UI/audio/settings/performance:** Dùng cùng descriptors/snapshots; terrain/palette/ambient/entities; camera/input/pause/menu/intro Ông Đăng/results/next/Bình Minh; HUD/mũi tên; settings/audio/gust/countdown; route thật cả3đêm và retry/pause, console/WebGL/audio; đo FPS chuẩn. Giữ assets nhẹ và credits; không xem SwiftShader là GPU thật. Hoàn tất RTM/evidence và independent review trước release được phép.

Đã cập nhật AGENTS và verify-game; lượt này chỉ thay đổi spec/harness. Không chạy hoặc tuyên bố PASS cho tính năng mới; chỉ kiểm tra skill và diff. Không có telemetry token hoặc chi phí thực tế. Ticket do người dùng cung cấp được giữ nguyên.

**Verdict tại thời điểm viết phân tích: READY FOR PHASE 2 IMPLEMENTATION, chờ duyệt giả định.** Nội dung trạng thái này được giữ làm lịch sử; kết quả implementation bên dưới mới nhất.

## Implementation record — Core & Headless

Được triển khai sau khi người dùng duyệt. Ticket-02 giữ nguyên; PRD-0 và evidence Phase 1 không sửa. Shared ESM Game Core không phụ thuộc DOM/Three.js; browser và headless dùng chung core cùng terrain query trong `src/data/worlds.js`. `src/headless/adapter.js` tách riêng mapping contract draft.

Đã triển khai standard tuning, ba map, fixed tick 60Hz/pipeline, pause, movement/jump/dash, pad/ramp/collision/fall/respawn, mote capacity/respawn/drop, partial lamp/safe zone, shade/drifter/charm/wind, pulse/scoring/terminal rules/night reset/campaign state, validation/CLI/scenarios/benchmark. Browser UI/audio/settings chưa thuộc lượt này.

| RTM group | Status | Evidence / limit |
|---|---|---|
| Tuning, canonical map data, terrain/pad/ramp/tower routes | PASS for tested points/routes; exhaustive collision envelope PARTIAL | `docs/proof/phase-2/core/` |
| Core state machines and timer boundaries | PARTIAL | Unit/headless coverage; not every Ticket edge/same-tick combination has a dedicated assertion |
| Internal headless known v1.1 delta, validation, deterministic replay | PARTIAL | Internal adapter only; v1.0 base/types and official compliance NOT VERIFIED |
| Win/loss, night retry/campaign | PARTIAL | Terminal precedence and score unit checks; no end-to-end winning route for every night demonstrated |
| Browser rendering/input/HUD/audio/settings/palette/FPS | NOT VERIFIED / deferred | Browser workstream not run |
| Linux/macOS and external independent QA | NOT VERIFIED | Not run this implementation turn |

Testing exposed and corrected implementation defects: lamp completion bonus omission; Night 3 ramp/pad support edge conditions; charm dash cooldown semantics; Gió Lạc dropped-loot exact position and chase-condition reset. Assertions were not weakened. Phase 1 evidence remains immutable. Token/cost telemetry is unavailable; no usage figure is asserted.

**Verification on 2026-11-21 (Windows 11, Node v24.13.0, npm v11.6.2):** `npm test` PASS 33/33; `npm run test:independent` PASS 7/7 authored cross-checks (not external QA); `npm run build` PASS; `npm run verify` PASS all 7 harness checks; `git diff --check` PASS. CLI generated deterministic 600-tick snapshots for nights 1, 2 and 3, each exit0/state playing, plus invalid CLI handling. This is a smoke scenario, not a completed win route. The benchmark ran 21,600 sim ticks twice on Night 3, both exit0/dawn at tick21600, pure JSON stdout, deterministic; elapsed 6,211.04ms and 6,418.09ms (each under30s). Build reports a non-blocking 568.25kB JS chunk warning.

Evidence: `verification.json`, `benchmark-night3.input.json`, `benchmark-night3.json`, `night-{1,2,3}.input.json`, `night-{1,2,3}.actual.json`, `core-smoke.json`, `independent-core.json` under `docs/proof/phase-2/core/`. These results do not verify browser behavior, Linux/macOS, external independent QA, or official contract compliance.

**Current scoped verdict: READY FOR BROWSER INTEGRATION**, with the partial/not-verified items above. Do not interpret this as official contract compliance or release readiness.
