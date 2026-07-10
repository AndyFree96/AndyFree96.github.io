# 从零开始学习GANs


生成对抗网络（GANs, generative adversarial networks）是由Ian Goodfellow等人在2014年的[Generative Adversarial Networks](https://arxiv.org/abs/1406.2661)一文中提出。Facebook的人工智能主管Yann Lecun对其的评价是：“机器学习在过去10年中最有趣的想法”。

<!--more-->

![](/images/201911/2/1.png)

GANs的潜力巨大，因为它们可以学习模仿任何数据分布。也就是说，GANs经过学习后，可以创造出类似于我们真实世界的一些东西，比如：图像、音乐、散文等等。从某种意义来说，它们是“机器人艺术家”，有些确实能够让人印象深刻。

![](/images/201911/2/2.jpg)

## 判别(Discriminative)和生成(Generative)

在开始介绍GANs之前，让我们先了解一下什么是生成模型和判别模型吧！

我们可能会经常看到数据以`(x,y)`对的形式出现，`x`是输入/特征（比如：图像，文本，语音等等），`y`是目标/标签。

![](/images/201911/2/3.png)

### 判别模型

对于判别模型而言，我们希望构建一个模型，在给定输入的情况下，这个模型可以将输入尽可能正确地找到对应的目标。

举例来说，给了上图所示的数据集中的一张图像比如鸟，模型就要尽可能地将这张鸟的图像归为`bird`一类。

判别模型学习的是条件概率分布，`p(y|x)`给定`x`后`y`的概率最大。这类模型学习到的是如何给定输入预测目标，换句话说，学习到的是目标的决策边界。它们并不关心数据是如何产生的，如何分布的。

### 生成模型

对于生成模型而言，我们希望构建一个模型能“弄懂”输入以产生类似的输入,它们的标签来自于目标。

举例来说，给了一张`bird`的图像，模型想要类似于`bird`的图像。

生成模型学习的是联合概率分布，`p(x,y) = p(y|x) *  p(x)`，它得学习`p(x)`。

它们关心数据和如何产生，如何分布的。

![](/images/201911/2/4.png)

## 生成对抗网络(GANs)

GANs就是生成模型，试图通过学习让模型尽可能生成逼真的输入分布。

GANs的最终目的是预测给定标签的特征，而不是预测给定特征的标签。

例如：如果我们将猫图像视为`x`，则GANs的目的是学习可以从训练数据`x`产生逼真可信猫图像的模型。

对生成对抗网络的一种直观理解是，想象一名造假者试图伪造红酒。一开始，作为一名小白，他非常不擅长这任务。他将自己造的假酒和真酒混在一起，并将其给品鉴师。品鉴师对每瓶酒进行真实评估，并向这个伪造者给出相应的反馈，告诉他怎么才是更真的红酒。造假者回到自己的作坊，根据品鉴师的反馈，开始制作一些新的假酒。随着时间的推移，二人一来一往的交流，造假者变得越来越擅长造假酒，品鉴师也变得越来越擅长找出假酒。最后，造假者终于造出了足以以假乱真的红酒。

整个过程可以类似下图所示：

![](/images/201911/2/5.png)

这就是GANs的工作原理：一个造假者网络和一个品鉴师网络，二者训练的目的都是为了打败彼此。具体来说，GANs由以下两部分组成。

- 生成器网络（Generator Network）: 以一个随机向量作为输入，将其解码成一张“伪造”图像。
- 判别器网络（Discriminator Network）：以一张图像（来自于训练集或生成网络“伪造”）作为输入，预测该图像是来自于训练集还是生成网络“伪造”的。

训练生成器网络的目的是使其能够欺骗判别器网络，因此随着训练的进行，它能够逐渐生成越来越逼真的图像，甚至达到以假乱真的程度，以至于判别器网络无法区分二者。同时，判别器网络也在不断也在不断“鉴伪”能力，为生成图像的真实性设置了很高的标准。一旦训练结束后，生成器就能够将其输入空间中的任何点转换为一张真实可信的图像。

![](/images/201911/2/6.png)

## 具体实现

下面，我们就基于上述想法将其[实现](https://github.com/eriklindernoren/Keras-GAN/blob/master/gan/gan.py)，使用的是MNIST数据集。

![](/images/201911/2/7.png)

```Python
from keras.datasets import mnist
from keras.layers import Input, Dense, Reshape, Flatten, Dropout
from keras.layers import BatchNormalization, Activation, ZeroPadding2D
from keras.layers.advanced_activations import LeakyReLU
from keras.layers.convolutional import UpSampling2D, Conv2D
from keras.models import Sequential, Model
from keras.optimizers import Adam
import matplotlib.pyplot as plt
import sys
import numpy as np

class GAN():
    def __init__(self):
        self.img_rows = 28
        self.img_cols = 28
        self.channels = 1
        self.img_shape = (self.img_rows, self.img_cols, self.channels)

        optimizer = Adam(0.0002, 0.5)

        # Build and compile the discriminator
        self.discriminator = self.build_discriminator()
        self.discriminator.compile(loss='binary_crossentropy',
            optimizer=optimizer,
            metrics=['accuracy'])

        # Build and compile the generator
        self.generator = self.build_generator()
        self.generator.compile(loss='binary_crossentropy', optimizer=optimizer)

        # The generator takes noise as input and generated imgs
        z = Input(shape=(100,))
        img = self.generator(z)

        # For the combined model we will only train the generator
        self.discriminator.trainable = False

        # The valid takes generated images as input and determines validity
        valid = self.discriminator(img)

        # The combined model  (stacked generator and discriminator) takes
        # noise as input => generates images => determines validity
        self.combined = Model(z, valid)
        self.combined.compile(loss='binary_crossentropy', optimizer=optimizer)

    def build_generator(self):

        noise_shape = (100,)

        model = Sequential()

        model.add(Dense(256, input_shape=noise_shape))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(512))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(1024))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(np.prod(self.img_shape), activation='tanh'))
        model.add(Reshape(self.img_shape))

        model.summary()

        noise = Input(shape=noise_shape)
        img = model(noise)

        return Model(noise, img)

    def build_discriminator(self):

        img_shape = (self.img_rows, self.img_cols, self.channels)

        model = Sequential()

        model.add(Flatten(input_shape=img_shape))
        model.add(Dense(512))
        model.add(LeakyReLU(alpha=0.2))
        model.add(Dense(256))
        model.add(LeakyReLU(alpha=0.2))
        model.add(Dense(1, activation='sigmoid'))
        model.summary()

        img = Input(shape=img_shape)
        validity = model(img)

        return Model(img, validity)

    def train(self, epochs, batch_size=128, save_interval=50):

        # Load the dataset
        (X_train, _), (_, _) = mnist.load_data()

        # Rescale -1 to 1
        X_train = (X_train.astype(np.float32) - 127.5) / 127.5
        X_train = np.expand_dims(X_train, axis=3)

        half_batch = int(batch_size / 2)

        for epoch in range(epochs):

            # ---------------------
            #  Train Discriminator
            # ---------------------

            # Select a random half batch of images
            idx = np.random.randint(0, X_train.shape[0], half_batch)
            imgs = X_train[idx]

            noise = np.random.normal(0, 1, (half_batch, 100))

            # Generate a half batch of new images
            gen_imgs = self.generator.predict(noise)

            # Train the discriminator
            d_loss_real = self.discriminator.train_on_batch(imgs, np.ones((half_batch, 1)))
            d_loss_fake = self.discriminator.train_on_batch(gen_imgs, np.zeros((half_batch, 1)))
            d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)


            # ---------------------
            #  Train Generator
            # ---------------------

            noise = np.random.normal(0, 1, (batch_size, 100))

            # The generator wants the discriminator to label the generated samples
            # as valid (ones)
            valid_y = np.array([1] * batch_size)

            # Train the generator
            g_loss = self.combined.train_on_batch(noise, valid_y)

            # Plot the progress
            print ("%d [D loss: %f, acc.: %.2f%%] [G loss: %f]" % (epoch, d_loss[0], 100*d_loss[1], g_loss))

            # If at save interval => save generated image samples
            if epoch % save_interval == 0:
                self.save_imgs(epoch)

    def save_imgs(self, epoch):
        r, c = 5, 5
        noise = np.random.normal(0, 1, (r * c, 100))
        gen_imgs = self.generator.predict(noise)

        # Rescale images 0 - 1
        gen_imgs = 0.5 * gen_imgs + 0.5

        fig, axs = plt.subplots(r, c)
        cnt = 0
        for i in range(r):
            for j in range(c):
                axs[i,j].imshow(gen_imgs[cnt, :,:,0], cmap='gray')
                axs[i,j].axis('off')
                cnt += 1
        fig.savefig("./mnist_%d.png" % epoch)
        plt.close()


if __name__ == '__main__':
    gan = GAN()
    gan.train(epochs=30000, batch_size=32, save_interval=200)
```

将上述代码保存到一个名为`GAN.py`的文件中并运行。

刚开始时，生成器网络生成的图像如下所示：

![](/images/201911/2/8.png)

经过8000个轮次（epoch）的训练，生成器网络“高明”了许多，生成的图像如下所示：

![](/images/201911/2/9.png)

生成手写数字感觉有点无趣，我们可以尝试生成别的，比如美女。为了获取到训练数据，我们到[美女\_360图片](http://image.so.com/z?ch=beauty)进行采集，具体如下所示：

```Python
import requests
import argparse
from requests import exceptions
import cv2
import os
from fake_useragent import UserAgent
import time

ap = argparse.ArgumentParser()
ap.add_argument("-q", "--query", required=True,
                help="search query")
ap.add_argument("-o", "--output", required=True,
                help="path to output directory of images")
args = vars(ap.parse_args())

user_agent = UserAgent()


EXCEPTIONS = set([IOError, FileNotFoundError,
    exceptions.RequestException, exceptions.HTTPError,
    exceptions.ConnectionError, exceptions.Timeout])

GROUP_SIZE = 30
MAX_RESULTS = 600
URL = "http://image.so.com/zj"

ch = args['query']
params = {'ch':ch, 'listtype':'new', 'temp':1}

total = 0
for sn in range(0, MAX_RESULTS, GROUP_SIZE):
    headers = {'User-Agent': user_agent.random}
    params['sn'] = sn
    search_result = requests.get(URL, headers=headers, params=params)
    results = search_result.json()

    for l in results['list']:
        try:
            print("Downloading: {}".format(l['qhimg_thumb_url']))
            r = requests.get(l['qhimg_thumb_url'], headers=headers, timeout=30)
            ext = l['qhimg_thumb_url'][l['qhimg_thumb_url'].rfind("."):]
            path = os.path.sep.join([args['output'], "{}{}".format(str(total).zfill(8), ext)])
            with open(path, 'wb') as file_obj:
                file_obj.write(r.content)
            time.sleep(1)
        except Exception as e:
            if type(e) in EXCEPTIONS:
                print("Skipping: {}".format(l['qhimg_thumb_url']))
                continue

        image = cv2.imread(path)
        if image is None:
            print('Deleting: {}'.format(path))
            os.remove(path)
            continue

        total += 1
```

不妨将上面的代码保存到一个名为`crawl_pics.py`的文件中，打开命令行输入`python crawl_pics.py -query beauty -o ./images`运行代码，图片就被我们采集到了。

![](/images/201911/2/10.png)

这时，如果想用`GAN.py`的代码的话，我们可以将采集到的图片进行相应的处理，新建一个名为`processing.py`的文件，写入以下代码：

```Python
import os
import cv2

image_folder = './images'
files = os.listdir(image_folder)
new_image_folder = 'new_images'

for file in files:
    image_path = "{}/{}".format(image_folder, file)
    new_image_path = "{}/{}".format(new_image_folder, file)
    img_gray_mode = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    print(image_path)
    resized_image = cv2.resize(img_gray_mode, (28, 28))
    cv2.imwrite(new_image_path,resized_image)
```

运行完就可以得到处理好的图片。然后，在`GAN.py`新增一个名为`load_data`的函数：

```Python
def load_data():
    image_folder = './new_images'
    files = os.listdir(image_folder)
    data = [cv2.imread("{}/{}".format(image_folder, file), cv2.IMREAD_GRAYSCALE)[newaxis,:,:] for file in files]
    data = np.concatenate(data, axis=0)
    return data
```

再将`GAN.py`中的`(X_train, _), (_, _) = mnist.load_data()`改为`X_train = load_data()`即可。

运行代码，经过29800个轮次（epoch）的训练后，生成器网络生成的“美女”图片如下所示：

![](/images/201911/2/11.png)

## 参考

[Ch:14 Generative Adversarial Networks (GAN’s) with Math.](https://medium.com/deep-math-machine-learning-ai/ch-14-general-adversarial-networks-gans-with-math-1318faf46b43)


---

> 作者: [AndyFree96](https://andyfree96.github.io/)  
> URL: http://localhost:1313/%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E5%AD%A6%E4%B9%A0gans/  

