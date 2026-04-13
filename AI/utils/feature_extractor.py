import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from torch import nn

# Global device and models
device = torch.device('cpu') # Enforce CPU to save battery/prevent CUDA crashes if no GPU
weights = models.MobileNet_V2_Weights.DEFAULT
model = models.mobilenet_v2(weights=weights).to(device)

# We want the features from before the classification head
class FeatureExtractor(nn.Module):
    def __init__(self, original_model):
        super(FeatureExtractor, self).__init__()
        self.features = original_model.features
        self.pooling = nn.AdaptiveAvgPool2d((1, 1))

    def forward(self, x):
        x = self.features(x)
        x = self.pooling(x)
        return x.view(x.size(0), -1)

extractor = FeatureExtractor(model).to(device)
extractor.eval()

preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def extract_image_features(image_path):
    print(f"Extracting visual features with MobileNetV2 for: {image_path}")
    try:
        img = Image.open(image_path).convert('RGB')
        img_tensor = preprocess(img).unsqueeze(0).to(device)
        with torch.no_grad():
            features = extractor(img_tensor)
        return features.cpu().numpy().flatten()
    except Exception as e:
        print(f"Error extracting visual features: {e}")
        return None
