const fragmentShader = /* glsl */ `
  precision lowp float;

  uniform float uTime;
  uniform float uScale;

  varying vec2 vUv;

  // 定义常量 PI
  #define PI 3.1415926

  // 随机函数（thebookofshaders.com 中找的）
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.2323))) * 43758.5453123);
  }

  // 旋转效果
  vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
  }

  // 噪声效果
  float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // 噪声函数2
  vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
  }

  vec2 fade(vec2 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
  }

  void main() {
    // // 1、通过顶点对应的 uv，决定每一个像素在 uv 图像的位置，通过位置决定这个像素的颜色
    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // // 2、利用 uv 实现渐变效果，从左到右
    // float strength = vUv.x;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 3、从下到上
    // float strength = vUv.y;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 4、从上到下
    // float strength = 1.0 - vUv.y;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 5、从下到上，短范围渐变
    // float strength = vUv.y * 10.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 6、从下到上，百叶窗效果，使用 mod 函数实现
    // float strength = mod(vUv.y * 10.0, 1.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 7、斑马线效果，使用 step 函数，如果 x < 0.5 返回 0.0，否则返回 1.0
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.5, strength);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 8、横纵斑马线效果相交（+= 改为 *=、-= 会有不同效果）
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 9、方块阵效果
    // float strength = step(0.2, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.2, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 10、"7"型彩色条纹效果
    // float barx = step(0.4, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
    // float bary = step(0.4, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    // float strength = barx + bary;
    // // gl_FragColor = vec4(strength, strength, strength, 1.0);
    // gl_FragColor = vec4(vUv, 1.0, strength);

    // // 11、"7"型条纹随时间变化效果
    // float barx = step(0.4, mod((vUv.x + uTime * 0.1) * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
    // float bary = step(0.4, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    // float strength = barx + bary;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 12、"7"型条纹偏移为"T"型条纹
    // float barx = step(0.4, mod((vUv.x * 10.0 - 0.2), 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
    // float bary = step(0.4, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
    // float strength = barx + bary;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 13、利用 abs 绝对值函数，中间向左右两侧渐变
    // float strength = abs(vUv.x - 0.5);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 14、利用 abs、min 函数，十字渐变
    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 15、利用 abs、max 函数，中心向外渐变（1.0 - max(...) 使中心亮两边暗）
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 16、亮矩形嵌套暗矩形（1.0 - step(...) 反过来）
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 17、使用向下取整 floor 函数实现条纹渐变（向上取整 ceil(...)）
    // float strength = floor(vUv.x * 10.0) / 10.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 18、使用向下取整 floor 函数实现斜向格子渐变
    // float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 19、使用随机函数实现电视雪花无信号效果
    // float strength = random(vUv);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 20、使用随机函数实现随机黑白格子效果
    // float strength = ceil(vUv.x * 10.0) / 10.0 * ceil(vUv.y * 10.0) / 10.0;
    // strength = random(vec2(strength, strength));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 21、根据 length 函数返回向量长度，以左下角为原点（以左下为原点渐变）
    // float strength = length(vUv);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 22、根据 distance 函数计算两个向量距离，以中心点为距离（以中心为原点渐变）
    // float strength = distance(vUv, vec2(0.5, 0.5));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 23、相除实现光晕效果（把最后 - 1.0 去掉则是矩形包含光晕效果）
    // float strength = 0.15 / distance(vUv, vec2(0.5, 0.5)) - 1.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 24、设置 vUv 水平或竖直变量设置压缩效果
    // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0), vec2(0.5, 0.5)) - 1.0;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 25、根据 23、24 实现十字交叉效果（* 改为 + 则是四角星效果）
    // float distanceX = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
    // float distanceY = 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
    // float strength = distanceX * distanceY;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 26、根据 25 实现四角星旋转效果
    // vec2 rotateUv = rotate(vUv, 3.14 * uTime, vec2(0.5, 0.5));
    // float distanceX = 0.15 / distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
    // float distanceY = 0.15 / distance(vec2(rotateUv.y, (rotateUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
    // float strength = distanceX + distanceY;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 27、矩形中绘制一个圆形（1.0 - step(...) 可以将颜色反过来）
    // float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.25);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 28、黑色矩形中的圆环
    // float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.35);
    // strength *= 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 29、黑色圆环（去掉 step 渐变效果）
    // float strength = step(0.1, abs(distance(vUv, vec2(0.5)) - 0.25));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 30、白色圆环
    // float strength = 1.0 - step(0.1, abs(distance(vUv, vec2(0.5)) - 0.25));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 31、波浪圆环
    // vec2 waveUv = vec2(vUv.x, vUv.y + sin(vUv.x * 30.0) * 0.1);
    // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 32、波浪圆环2
    // vec2 waveUv = vec2(vUv.x + sin(vUv.y * 30.0) * 0.1, vUv.y + sin(vUv.x * 30.0) * 0.1);
    // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 33、波浪圆环3
    // vec2 waveUv = vec2(vUv.x + sin(vUv.y * 100.0) * 0.1, vUv.y + sin(vUv.x * 100.0) * 0.1);
    // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 34、通过角度显示视图
    // float strength = atan(vUv.x, vUv.y);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 35、通过角度螺旋渐变
    // float strength = (atan(vUv.x - 0.5, vUv.y - 0.5) + 3.14) / 6.28;
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 36、实现雷达扫描效果
    // vec2 rotateUv = rotate(vUv, -uTime * 3.14, vec2(0.5, 0.5));
    // float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5)));
    // float strength = (atan(rotateUv.x - 0.5, rotateUv.y - 0.5) + 3.14) / 6.28;
    // gl_FragColor = vec4(strength, strength, strength, alpha);

    // // 37、万花筒效果
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / PI;
    // float strength = mod(angle * 10.0, 1.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 38、光芒四射效果
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (2.0 * PI);
    // float strength = sin(angle * 100.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 39、波纹效果
    // float strength = step(0.5, noise(vUv * 20.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 40、波纹效果随时间移动
    // float strength = step(uScale, cnoise(vUv * 10.0 + uTime));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 41、波纹效果发光路径
    // float strength = sin(cnoise(vUv * 10.0) * 10.0 + uTime);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // // 42、波纹效果发光路径锐利条纹
    // float strength = step(0.9, sin(cnoise(vUv * 10.0) * 10.0));
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // 43、波纹效果发光路径混合颜色
    vec3 yellow = vec3(1.0, 1.0, 0.0);
    vec3 uvColor = vec3(1.0, 0.0, vUv);

    float strength = step(0.9, sin(cnoise(vUv * 10.0) * 10.0));

    vec3 mixColor = mix(uvColor, yellow, strength);
    gl_FragColor = vec4(mixColor, 1.0);
  }
`;

export default fragmentShader;
