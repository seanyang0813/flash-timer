# The Matsumoto barbell-extension lemma — deployed extract

This compact note records the local statement audited by the `/proof` page.

## Conventions

Products act on curves rightmost first and all Dehn twists are right-handed. Let

```text
Y = (S^2 x T^2) # 4 CPbar^2
```

carry Matsumoto's genus-two Lefschetz fibration, with regular fiber `Sigma` and four disjoint `(-1)`-sections `E_1,...,E_4`. Put

```text
delta = boundary N(c_3 union c_4)
d = t_delta = (t_4 t_3)^6.
```

## Relative-collar lemma

The standard thickened-barbell representative `beta` may be chosen so that:

1. it is compactly supported in the interior of the barbell;
2. it fixes both cuff spheres pointwise;
3. it is the identity on prescribed smaller tubular neighborhoods of the cuffs, except for the three active twist annuli in the central pair of pants;
4. it is the identity on open neighborhoods of two prescribed off-equatorial transverse disk germs on each cuff;
5. its induced action on the oriented normal two-plane bundle along the central pair of pants is the identity.

### Reason

In the based-ball definition, the complementary balls return as parameterized embeddings. Isotopy extension can make the time-one map fix both balls and therefore both cuff spheres pointwise. Along a fixed cuff the normal derivative is

```text
S^2 -> GL^+(2,R) homotopy-equivalent S^1.
```

It is null-homotopic because `[S^2,S^1]=0`. Relative tubular-neighborhood straightening realizes this null-homotopy as an isotopy to the literal identity on a smaller cuff neighborhood. The boundary-twist annuli can be supported outside still smaller collars, so the surface mapping class is unchanged. The four chosen transverse disks are placed inside the straightened neighborhoods and are therefore fixed on open neighborhoods, not merely setwise.

Niu's `(t,y)`-level formula has identity map on the normal quotient along the central slice. Rescaling the normal variables straightens the germ to the product of the central surface action and the identity normal map.

## Matsumoto barbell-extension lemma

There is an orientation-preserving pair diffeomorphism

```text
Phi : (Y,Sigma) -> (Y,Sigma)
```

which is product-framed near `Sigma` and satisfies

```text
Phi|Sigma = t_delta = d.
```

### Construction

The transported type-IIA `B_0` pair gives an embedded matching sphere

```text
R = D_1 union_(B_0) D_2.
```

Its two thimbles have prescribed relative framing `-1`. The matching annulus meets exactly `E_1` and `E_2`, once each. Orient the sections so that `D_i . E_i = +1` and resolve:

```text
e(nu Dhat_i,n)
  = (-1) + (-1) + 2(+1)
  = 0.                                                    (5)
```

The two resolutions occur in disjoint balls. As an independent closed-surface check,

```text
Rhat^2 = -2 -1 -1 +2 +2 = 0.                             (6)
```

The separate relative calculation (5), not merely the aggregate check (6), shows that the prescribed normal extends over both completed hemispheres. Opposite push-offs give two disjoint framed square-zero cuffs `S_+` and `S_-` meeting `Sigma` cleanly in `B_0^+` and `B_0^-`.

Exact quotient coordinates give `i(B_0,delta)=0`, and the active pair of pants satisfies

```text
boundary P = delta union B_0^+ union B_0^-.               (7)
```

Implanting the positive barbell model gives

```text
beta_Y|Sigma
  = t_delta t_(B_0^+)^-1 t_(B_0^-)^-1
  = t_delta t_B0^-2.                                     (8)
```

There is no hidden conjugate curve or hidden power: the outer boundary occurs once and is identified with `delta`.

Local `B_0` monodromy has a product-framed ambient extension

```text
M_B0(x,z) = (t_B0(x),z)
```

near the fiber. Since `B_0` and `delta` are disjoint, set

```text
Phi = M_B0^2 o beta_Y.
```

Then

```text
Phi|Sigma = t_B0^2(t_delta t_B0^-2) = t_delta = d.
```

Powers and inverses of `Phi` realize every integer, so the extension subgroup is

```text
E = {n in Z : d^n extends over (Y,Sigma)} = Z.
```

## Source scope

The local barbell source is Weizhe Niu's 2024 University of Glasgow thesis, §2.1, especially Definitions 2.1 and 2.5 and Proposition 2.6: <https://doi.org/10.5525/gla.thesis.84779>.

The statement that prescribed open neighborhoods of the four polar disks are fixed is **not** quoted from Proposition 2.6. It is the separate relative-collar argument above.
