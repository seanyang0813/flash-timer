# Publication-hardened Matsumoto extension theorem — deployed proof extract

This is the compact verification extract used by the interactive `/proof` page. The complete source report was supplied separately to the project. The purpose of this copy is to expose the exact claims, equations, source locks, and evidence boundary without forcing a reader to search the research repository.

## Main conclusions

Let

```text
Y = (S^2 x T^2) # 4 CPbar^2
```

carry Matsumoto's genus-two regular fiber `Sigma`. In the fixed five-chain convention put

```text
delta = boundary N(c_3 union c_4)
d = (t_4 t_3)^6 = t_delta.
```

There is an orientation-preserving diffeomorphism of pairs

```text
Phi : (Y,Sigma) -> (Y,Sigma)
```

whose germ near the fiber is product-framed:

```text
(x,z) -> (d(x),z),   (x,z) in Sigma x D^2.
```

Consequently `Phi|_Sigma=d`, and every positive and negative power extends:

```text
E = {n in Z : d^n extends over (Y,Sigma)} = Z.
```

For the fiber sums

```text
X_n = Y_1^o union_(g_n) Y_2^o
g_n(x,e^(i theta)) = (d^n(x),e^(-i theta)),
```

one has

```text
X_n diffeomorphic+ X_0 diffeomorphic+ E(1,1)
```

for every integer `n`. These diffeomorphisms are unmarked: preservation of the displayed fibrations, sections, necks, gluing coordinates, and surgery tori is not asserted.

## 1. Source-locked transported pair

Hamada's type-IIA relation supplies four pairwise disjoint `(-1)`-sections `E_i`. Baykur–Hamada transport the second `B_0` curve to

```text
B'_0,2 = t_C2^-1 t_B2,2^-1 t_B1,2^-1(B_0,2),
```

and state that `B_0,1` and `B'_0,2` are disjoint. Printed mod-two classes and an exact faithful `B_6` partial-versus-full cap calculation select

```text
Q = Sigma_0^4
boundary Q = B_0,1 union B'_0,2 union delta_1 union delta_2.
```

After capping, `Q` becomes the matching annulus. The corresponding thimbles form the matching sphere

```text
R = D_1 union_(B_0) D_2,
```

which meets exactly `E_1` and `E_2`, once each.

## 2. Separate integral framing corrections

Take the reference fiber between the two section crossings. Each Lefschetz thimble has prescribed relative framing `-1` along `B_0`. Orient `E_i` so that `D_i . E_i = +1`. Resolving the unique intersection gives

```text
e(nu Dhat_i,n) = -1 - 1 + 2(+1) = 0,   i=1,2.       (10)
```

This is a separate relative calculation for each hemisphere. It is stronger than the aggregate square-zero check

```text
Rhat^2 = -2 - 1 - 1 + 2 + 2 = 0.                      (11)
```

The prescribed equatorial normal extends over both completed hemispheres. Opposite push-offs therefore give two disjoint framed square-zero cuffs `S_+` and `S_-` whose clean intersections with the fiber are `B_0^+` and `B_0^-`.

Exact quotient coordinates give `i(B_0,delta)=0`. Cutting the one-holed torus side along `B_0` gives the active pair of pants

```text
boundary P = delta union B_0^+ union B_0^-.            (7)
```

## 3. Exact Niu input

Weizhe Niu's thesis, §2.1, Definitions 2.1 and 2.5 and Proposition 2.6, constructs a boundary-fixing diffeomorphism of the thickened barbell

```text
B = (S^2 x D^2) natural (S^2 x D^2)
```

with `(t,y)`-level normal form and a central twice-punctured-disk point push. With the outer boundary oriented positively, the central mapping class is

```text
beta|P_0 = t_a0 t_a+^-1 t_a-^-1.                      (8)
```

The Matsumoto implantation identifies

```text
a_0 = delta
a_+ = B_0^+
a_- = B_0^-.
```

Niu's proposition is not quoted as saying that prescribed open polar collars are fixed. That stronger relative statement is proved separately.

## 4. Relative polar-collar straightening

The based-ball time-one map may be chosen to fix both cuff spheres pointwise. Its normal derivative on a cuff is a map

```text
S^2 -> GL^+(2,R) homotopy-equivalent S^1.
```

This map is null-homotopic because `[S^2,S^1]=0`. Relative tubular-neighborhood straightening therefore isotopes the representative, relative to the cuff, to the literal identity on a smaller cuff neighborhood. The three active twist annuli are kept outside smaller boundary collars.

The four off-equatorial polar disk germs are placed inside these straightened neighborhoods. Hence they are fixed pointwise on open four-dimensional neighborhoods—not merely preserved setwise. No polar disk contributes an extra boundary twist.

Along the active pair of pants, Niu's level form has identity action on the oriented normal quotient. Normal rescaling straightens the germ to the product of the surface mapping class with the identity on `D^2`.

## 5. Exact surface restriction

Only the three active annuli contribute. Thus

```text
beta_Y|Sigma
  = t_delta t_(B_0^+)^-1 t_(B_0^-)^-1
  = t_delta t_B0^-2.                                   (13)
```

The outer support is exactly `delta=boundary N(c_3 union c_4)`, and the exponent is exactly `+1`: it is not a square and not a conjugate curve.

Local monodromy around the `B_0` critical value has a product-framed ambient extension

```text
M_B0(x,z) = (t_B0(x),z)
```

near `Sigma`. Since `B_0` is disjoint from `delta`, define

```text
Phi = M_B0^2 o beta_Y.
```

Then

```text
Phi|Sigma
  = t_B0^2 t_delta t_B0^-2
  = t_delta
  = d.                                                  (14)
```

## 6. Fiber-sum gluing

Let the boundary germ be

```text
Phi_hat(x,e^(i theta)) = (d(x),e^(i theta)).
```

For every integer `n`, including negative `n`,

```text
g_0 o Phi_hat^n(x,e^(i theta))
  = (d^n(x),e^(-i theta))
  = g_n(x,e^(i theta)).                                 (15)
```

Therefore the piecewise map `Phi^n` on the first exterior and the identity on the second respects the quotient relation and descends to an orientation-preserving diffeomorphism

```text
Psi_n : X_n -> X_0.
```

The established source-locked identity-sum branched-cover calculation identifies `X_0` with `E(1,1)`.

## Evidence boundary

### Exact computations

- source mapping-class and braid words;
- partial-versus-full cap distinction;
- boundary subset `{delta_1,delta_2}`;
- curve support and disjointness calculations;
- framing and exponent arithmetic;
- exponent vector `(1,-1,-1)+(0,1,1)=(1,0,0)`;
- literal boundary composition (15).

### Human differential topology

- embeddedness of the matching sphere;
- local section resolutions and their geometric signs;
- construction and push-off of the square-zero cuffs;
- barbell implantation into `Y`;
- relative tubular-neighborhood straightening;
- product-framed ambient monodromy extension;
- smooth descent through the fiber-sum quotient.

These geometric steps are not Lean theorems and are not certified by a test count.

## Source locks

- Noriyuki Hamada, *Sections of the Matsumoto–Cadavid–Korkmaz Lefschetz fibration*, <https://arxiv.org/abs/1610.08458>
- R. İnanç Baykur and Noriyuki Hamada, *Lefschetz fibrations with arbitrary signature*, <https://arxiv.org/abs/2010.11916>
- R. İnanç Baykur, *Small symplectic Calabi–Yau surfaces and exotic 4-manifolds via genus-3 pencils*, <https://arxiv.org/abs/1511.05951>
- Weizhe Niu, *Mapping class groups of 4-manifolds via barbell diffeomorphisms, Budney–Gabai invariants and handle structures*, PhD thesis, §2.1, DOI <https://doi.org/10.5525/gla.thesis.84779>
- Ryan Budney and David Gabai, *Knotted 3-balls in S^4*, <https://arxiv.org/abs/1912.09029>
- Ryan Budney and David Gabai, *On the automorphism groups of hyperbolic manifolds*, <https://arxiv.org/abs/2303.05010>
