import os, sys, gc
from osgeo import gdal
from osgeo import osr
from osgeo import ogr
from  tqdm import tqdm
import numpy as np
from tqdm.contrib import itertools
import time


# Global variables
progress:int = 0
out_file = None
saving:bool = False
start:bool = False
out_array:np.ndarray = None
rt = None

# Load and save raster files
def loadRasterImage(path):
    """ 
    Load a raster image from disk to memory
    Args:
        path (str): Path to file

    Returns:
        (Dataset GDAL object): Object that contains the structure of the raster file
        (array): Image in array format
        (boolean): Indicates that if there is an error
        (str): Indicates the associated error message
    """
    global rt
    raster_ds = gdal.Open(path, gdal.GA_ReadOnly)
    if raster_ds is None:
        return None, None, True, "The file cannot be opened."
    print("Driver: ", raster_ds.GetDriver().ShortName, '/', raster_ds.GetDriver().LongName)
    print("Size: ({}, {}, {})".format(raster_ds.RasterXSize, raster_ds.RasterYSize, raster_ds.RasterCount))
    if raster_ds.RasterCount == 1:
        rt = raster_ds
        return raster_ds, raster_ds.GetRasterBand(1).ReadAsArray(), False, ""
    else:
        rt = raster_ds
        return raster_ds, np.stack([raster_ds.GetRasterBand(i).ReadAsArray() for i in tqdm(range(1, raster_ds.RasterCount+1), 'Loading ')], axis=2).astype(np.int16), False, ""
     

def saveSingleBand(dst, rt, img, tt=gdal.GDT_Float32): ##
    """
    Save a raster image from memory to disk

    Args:
        dst (str): Path to output file
        rt  (Dataset GDAL object): Object that contains the structure of the raster file
        img (array): Image in array format
        tt  (GDAL type, optional): Defaults to gdal.GDT_Float32. Type in which the array is to be saved.
        typ (str, optional): Defaults to 'GTiff'. Driver used to save.
    """
    transform = rt.GetGeoTransform()
    driver = rt.GetDriver()
    output = driver.Create(dst, rt.RasterXSize, rt.RasterYSize, 1,tt)
    wkt = rt.GetProjection()
    srs = osr.SpatialReference()
    srs.ImportFromWkt(wkt)
    output.GetRasterBand(1).WriteArray(img)
    output.GetRasterBand(1).SetNoDataValue(-999)
    output.SetGeoTransform(transform)
    output.SetProjection(srs.ExportToWkt())
    output = None   


def CCT(array:np.ndarray, path:str, raster):
    """Calculate the cycle-change-trend detector of an image given an array
    
    Args:
        array (np.ndarray): Matrix of the raster image autocorrelation
        path (str): Path to the raster image
        raster (Dataset GDAL object): Object that contains the structure of the raster file
        numfilesyear (int): Number of files per year
    """
    global progress, out_file, saving, out_array, start, mask, total

    progress = 0
    saving = False
    start = True
    total = array.shape[0]*array.shape[1]
    
    inicio = time.time()
    # send the total to the progress bar
    # Read raster
    height, width = array.shape[:2]
    name, ext = os.path.splitext(path)
    # create the mask
    mask = np.zeros((height, width), dtype=np.int16)
    
    # split the array in two parts
    print("Splitting...")
    p1, p2 = np.split(array, 2, axis=2)
    
    # calculate the slope beteween the two parts
    print("Calculating slope...")
    slope = (np.mean(p2, axis=2) - np.mean(p1, axis=2)).round(2)
    
    # calculate the percentage of negative values
    print("Calculating negative percentage...")
    perc = np.round(np.count_nonzero(array < 0, axis=2) / array.shape[2] * 100, 2).astype(np.int16)
    
    # generate the fourier transform
    # fft = np.fft.fft(array, axis=2)
    # freq = np.fft.fftfreq(array.shape[2])
    # fft = np.abs(fft[:,:,:int((array**2).shape[2]/2)])**2//(10**6) # calculate the power spectrum
    # freq = freq[:int(freq.shape[2]/2)] # get the positive frequencies

    # del array # free memory
    # gc.collect() # free memory
    
    # classification algorithm
    for i, j in itertools.product(range(slope.shape[0]), range(slope.shape[1])):
        fft = np.fft.fft(array[i][j])
        fftfreq = np.fft.fftfreq(len(array[i][j]))
        fourier = abs(fft[:int(len(fft**2)/2)])**2//(10**6)
        ffreq = fftfreq[:int(len(fftfreq)/2)]
        
        if slope[i][j] < -42 and perc[i][j] >= 55: # Posible change with high percentage of negative values and moderate slope
            if 1/ffreq[np.nonzero(fourier == np.max(fourier))[0][0]] == 46: # Look for the maximum frequency and check if it is 1/46
                if 1/ffreq[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] == 23 and fourier[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] >= 800: # Look for the second maximum frequency and check if it is 1/23
                    mask[i][j] = 2 # 2 = 2 cycle 
                else:
                    mask[i][j] = 0 # 0 = 1 cycle
            else:
                mask[i][j] = 4 # 4 = 0 cycle/change
        elif ffreq[np.nonzero(fourier == np.max(fourier))[0][0]] == 0 or (slope[i][j] < -105 and perc[i][j] < 55): # Big slope means trend
            if 1/ffreq[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] == 23 and fourier[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] >= 150: # 2 cycle identification
                mask[i][j] = 3 # 3 = 2 cycle trend
            else:
                mask[i][j] = 1 # 1 = 1 cycle trend
        else: # low slope means no change or no trend, with an acceptable percentage of negative values that indicates stability on the curve
            if 1/ffreq[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] == 23 and fourier[np.nonzero(fourier == np.max(fourier[12:]))[0][0]] >= 800: # Look for the second maximum frequency and check if it is 1/23
                mask[i][j] = 2 # 2 = 2 cycle
            else:  
                mask[i][j] = 0 # 0 = 1 cycle
                
        progress = int((i * slope.shape[1] + j) / total * 100)

    
    progress = 100
    print("Time: ", time.time() - inicio, "s")
    # Save the mask
    print("Saving...")
    saving = True
    out_file = name + "_CCT"
    saveSingleBand(out_file, raster, mask, gdal.GDT_Int16)
    
    saving = False
    start = False


def CCTFile(path:str):
    """Calculate the CCT detector of raster image 

    Args:
        path (str): Path to the raster image
    """
    # Read raster
    rt, img, err, msg = loadRasterImage(path) 
    if err:
        print(msg)
        sys.exit(1)

    CCT(img, path, rt)
    
    
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python3 {sys.argv[0]} <path-file>")
        print("<path-file>: path to the raster image")
        sys.exit(1)
        
    CCTFile(sys.argv[1])